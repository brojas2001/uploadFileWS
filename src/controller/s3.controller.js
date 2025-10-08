const {getUploadURL, getDownloadURL, listFilesBySociedadCliente} = require("../services/s3.service.js");
const AppDataSource = require("../data-source");
const Files = require("../entity/Files");


//GENERA LA URL FIRMADA PARA SUBIR ARCHIVOS A S3 CON ESTRUCTURA DE CARPETAS
const generateUploadURL = async (req, res) => {
  try {
    const { fileName, fileType, sociedad, cliente } = req.query;
    
    if (!fileName || !fileType || !sociedad || !cliente) {
      return res.status(400).json({ 
        error: "Faltan parámetros: fileName, fileType, sociedad y cliente son requeridos" 
      });
    }

    const result = await getUploadURL(fileName, fileType, sociedad, cliente);
    res.json({ 
      uploadURL: result.url, 
      filePath: result.fullPath,
      sociedad,
      cliente
    });
  } catch (error) {
    console.error("Error al generar URL de subida:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};


//GENERA LA URL FIRMADA PARA DESCARGAR ARCHIVOS DE S3
const generateDownloadURL = async (req, res) => {
  try {    const { filePath, sociedad, cliente, fileName } = req.query;
    
    // Permitir descargar por filePath completo o por sociedad/cliente/fileName
    let fullPath;
    if (filePath) {
      fullPath = filePath;
    } else if (sociedad && cliente && fileName) {
      // Recrear la ruta usando la misma lógica que en el servicio
      const cleanSociedad = sociedad.replace(/[^a-zA-Z0-9\-_]/g, '_');
      const cleanCliente = cliente.replace(/[^a-zA-Z0-9\-_]/g, '_');
      fullPath = `${cleanSociedad}/${cleanCliente}/${fileName}`;
    } else {
      return res.status(400).json({ 
        error: "Se requiere 'filePath' o 'sociedad', 'cliente' y 'fileName'" 
      });
    }

    const downloadURL = await getDownloadURL(fullPath);
    res.json({ downloadURL, filePath: fullPath });
  } catch (error) {
    console.error("Error al generar URL de descarga:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

// REGISTRA EN BASE DE DATOS DESPUÉS DE UNA SUBIDA EXITOSA
const createFileRecord = async (req, res) => {
  try {
    const { fileName, sociedad, cliente, filePath } = req.body;
    
    if (!fileName || !sociedad || !cliente) {
      return res.status(400).json({ 
        error: "fileName, sociedad y cliente son requeridos" 
      });
    }

    const fileRepository = AppDataSource.getRepository("Files");
    
    const newFile = {
      file_name: filePath || `${sociedad}/${cliente}/${fileName}`, // Guardar ruta completa
      file_date: new Date(),
      sociedad: sociedad,
      cliente: cliente
    };
    
    const savedFile = await fileRepository.save(newFile);
    
    res.status(201).json({ 
      message: "Archivo registrado exitosamente",
      file: savedFile,
      organization: {
        sociedad,
        cliente,
        filePath: newFile.file_name
      }
    });
    
  } catch (error) {
    console.error("Error al crear registro de archivo:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

// LISTAR ARCHIVOS POR SOCIEDAD Y CLIENTE
const listFiles = async (req, res) => {
  try {
    const { sociedad, cliente } = req.query;
    
    // Listar archivos en S3
    const s3Files = await listFilesBySociedadCliente(sociedad, cliente);
    
    // Si se especifica sociedad y cliente, también buscar en BD
    let dbFiles = [];
    if (sociedad || cliente) {
      const fileRepository = AppDataSource.getRepository("Files");
      const whereClause = {};
      
      if (sociedad) whereClause.sociedad = sociedad;
      if (cliente) whereClause.cliente = cliente;
      
      dbFiles = await fileRepository.find({ where: whereClause });
    }
    
    res.json({ 
      s3Files: s3Files.map(file => ({
        key: file.Key,
        size: file.Size,
        lastModified: file.LastModified
      })),
      dbRecords: dbFiles,
      filter: { sociedad, cliente }
    });
    
  } catch (error) {
    console.error("Error al listar archivos:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

module.exports = {
  generateUploadURL,
  generateDownloadURL,
  createFileRecord,
  listFiles
};
