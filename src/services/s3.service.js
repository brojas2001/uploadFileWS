const dotenv = require("dotenv");
const AWS = require("aws-sdk");

dotenv.config();

const s3 = new AWS.S3({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

//CREAR ESTRUCTURA DE CARPETAS: SOCIEDAD/CLIENTE/ARCHIVO
const createFolderPath = (sociedad, cliente, fileName) => {
  // Limpiar nombres para evitar caracteres especiales en S3
  const cleanSociedad = sociedad.replace(/[^a-zA-Z0-9\-_]/g, '_');
  const cleanCliente = cliente.replace(/[^a-zA-Z0-9\-_]/g, '_');
  
  return `${cleanSociedad}/${cleanCliente}/${fileName}`;
};

//GENERAR URL PARA SUBIDA CON ESTRUCTURA DE CARPETAS
const getUploadURL = async (fileName, fileType, sociedad, cliente) => {
  try {
    if (!fileName || !fileType || !sociedad || !cliente) {
      throw new Error("fileName, fileType, sociedad y cliente son requeridos");
    }

    // Crear la ruta completa con estructura de carpetas
    const fullPath = createFolderPath(sociedad, cliente, fileName);

    const params = {
      Bucket: process.env.S3_BUCKET,
      Key: fullPath,
      Expires: 60, // segundos
      ContentType: fileType,
    };

    const url = await s3.getSignedUrlPromise("putObject", params);
    return { url, fullPath };
  } catch (error) {
    console.error("Error al generar URL de subida:", error);
    throw new Error("No se pudo generar la URL de subida");
  }
};

// GENERAR URL PARA DESCARGA CON MANEJO DE ERRORES
const getDownloadURL = async (filePath) => {
  try {
    if (!filePath) {
      throw new Error("filePath es requerido");
    }

    const params = {
      Bucket: process.env.S3_BUCKET,
      Key: filePath, // Ahora acepta la ruta completa
      Expires: 60,
    };

    const url = await s3.getSignedUrlPromise("getObject", params);
    return url;
  } catch (error) {
    console.error("Error al generar URL de descarga:", error);
    throw new Error("No se pudo generar la URL de descarga");
  }
};

// LISTAR ARCHIVOS POR SOCIEDAD Y CLIENTE
const listFilesBySociedadCliente = async (sociedad, cliente) => {
  try {
    const prefix = sociedad && cliente ? 
      `${sociedad.replace(/[^a-zA-Z0-9\-_]/g, '_')}/${cliente.replace(/[^a-zA-Z0-9\-_]/g, '_')}/` :
      '';

    const params = {
      Bucket: process.env.S3_BUCKET,
      Prefix: prefix,
    };

    const data = await s3.listObjectsV2(params).promise();
    return data.Contents || [];
  } catch (error) {
    console.error("Error al listar archivos:", error);
    throw new Error("No se pudo listar los archivos");
  }
};

module.exports = {
  getUploadURL,
  getDownloadURL,
  listFilesBySociedadCliente,
  createFolderPath,
};
