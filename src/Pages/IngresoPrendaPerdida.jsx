import React, { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardActions,
  Button,
  TextField,
  Box,
  Typography,
  Grid,
  Alert,
  Paper,
  Chip,
  FormLabel,
  ToggleButton,
  ToggleButtonGroup,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  InputAdornment,
  IconButton,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  AlertTitle,
  Backdrop
} from "@mui/material";
import { Save, Person, LocalOffer, CheckCircle, Search, Clear, Check, Close } from "@mui/icons-material";
import axios from "axios"
const IngresoPrendaPerdida = () => {
  const API_BASE_URL = import.meta.env.VITE_URL_API;
  // Sistema de alertas mejorado (consistente con Home)
  const [alert, setAlert] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const [isLoading, setIsLoading] = useState(false);
  
  // Estados para el buscador y resultados
  const [searchRut, setSearchRut] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);
  
  // Estados para el diálogo de confirmación
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [selectedGarment, setSelectedGarment] = useState(null);
  const [returnStatus, setReturnStatus] = useState("");
  const [updateLoading, setUpdateLoading] = useState(false);

  // Estados para el registro de devolución
  const RETURN_STATUSES = [
    "Encontrada - Pendiente de devolución",
    "Devuelta al propietario",
    "No reclamada - En bodega",
    "Donada",
    "Desechada"
  ];

  // Función para buscar prendas por RUT
  const handleSearch = async () => {
    if (!searchRut.trim()) {
      showAlert("Por favor ingrese un RUT para buscar", "error");
      return;
    }
  
    setSearchLoading(true);
    setSearchPerformed(true);
  
    // Usar tu variable de entorno actual de Vite
    const API_BASE_URL =  'https://lostandfoundapi-kfe8.onrender.com/';
    
    // Asegurar que no haya doble slash
    const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
  
    try {
      console.log("🔍 Iniciando búsqueda...");
      console.log("📋 RUT a buscar:", searchRut);
      console.log("🌐 URL API configurada:", baseUrl);
      console.log("🔗 Endpoint completo:", `${baseUrl}/prendas`);
      
      const response = await axios.get(`${baseUrl}/prendas`, {
        params: {
          rut: searchRut
        },
        timeout: 30000, // 30 segundos
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log("✅ Respuesta exitosa:");
      console.log("   - Status:", response.status, response.statusText);
      console.log("   - Datos recibidos:", response.data);
      console.log("   - Cantidad de resultados:", Array.isArray(response.data) ? response.data.length : 'No es array');
      
      const results = Array.isArray(response.data) ? response.data : [];
      setSearchResults(results);
      
      if (results.length === 0) {
        showAlert("No se encontraron prendas para el RUT especificado", "info");
        console.log("ℹ️ Sin resultados para RUT:", searchRut);
      } else {
        showAlert(`Se encontraron ${results.length} prenda(s) para el RUT ${searchRut}`, "success");
        console.log(`✅ ${results.length} prenda(s) encontrada(s)`);
      }
      
    } catch (error) {
      console.error("💥 Error en búsqueda:", error);
      console.error("🌐 URL que falló:", `${baseUrl}/prendas`);
      
      let errorMessage = "Error en la búsqueda";
      
      if (error.code === 'ECONNABORTED') {
        errorMessage = "La búsqueda tardó demasiado. Intente nuevamente.";
      } else if (error.response) {
        console.error("📡 Respuesta de error:", {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data
        });
        
        switch (error.response.status) {
          case 404:
            errorMessage = "Endpoint no encontrado en el servidor";
            break;
          case 500:
            errorMessage = "Error interno del servidor";
            break;
          case 400:
            errorMessage = "Solicitud inválida. Verifique el RUT";
            break;
          default:
            errorMessage = `Error del servidor: ${error.response.status}`;
        }
      } else if (error.request) {
        console.error("📡 Sin respuesta del servidor");
        errorMessage = "No se pudo conectar con el servidor. Verifique su conexión.";
      } else {
        console.error("⚙️ Error de configuración:", error.message);
        errorMessage = `Error de configuración: ${error.message}`;
      }
      
      showAlert(errorMessage, "error");
      setSearchResults([]);
      
    } finally {
      setSearchLoading(false);
      console.log("🏁 Búsqueda finalizada");
    }
  };

  // Función para limpiar la búsqueda
  const handleClearSearch = () => {
    setSearchRut("");
    setSearchResults([]);
    setSearchPerformed(false);
    showAlert("Búsqueda limpiada", "info");
  };

  // Función para abrir el diálogo de confirmación de devolución
  const handleOpenReturnDialog = (garment) => {
    setSelectedGarment(garment);
    setReturnStatus(garment.estado_devolucion || "");
    setConfirmDialogOpen(true);
  };

  // Función para cerrar el diálogo de confirmación
  const handleCloseReturnDialog = () => {
    setConfirmDialogOpen(false);
    setSelectedGarment(null);
    setReturnStatus("");
    setUpdateLoading(false);
  };

  // Función mejorada para confirmar el cambio de estado
  const handleConfirmReturn = async () => {
    if (!selectedGarment || !returnStatus) {
      showAlert("Por favor seleccione un estado válido", "warning");
      return;
    }
    
    setUpdateLoading(true);

    const API_BASE_URL =  'https://lostandfoundapi-kfe8.onrender.com/';
    
    // Asegurar que no haya doble slash
    const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
    
    try {
      console.log("🔄 Actualizando estado de prenda ID:", selectedGarment.id, "a:", returnStatus);
      
      const response = await fetch(`${baseUrl}/prendas/${selectedGarment.id}/estado`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          estado_devolucion: returnStatus
        })
      });

      const responseData = await response.json();
      console.log("📡 Respuesta de actualización:", response.status, responseData);

      if (response.ok) {
        // Actualizar el estado local
        setSearchResults(prev => 
          prev.map(item => 
            item.id === selectedGarment.id 
              ? { ...item, estado_devolucion: returnStatus } 
              : item
          )
        );
        
        // Mensaje de éxito mejorado
        const mensajeExito = `¡Estado actualizado con éxito! 
        Prenda ID ${selectedGarment.id} (${selectedGarment.tipo_prenda}) 
        cambió a: "${returnStatus}"`;
        
        showAlert(mensajeExito, "success");
        
        // Cerrar el diálogo después de un breve delay para mostrar el éxito
        setTimeout(() => {
          handleCloseReturnDialog();
        }, 500);
        
      } else {
        console.error("❌ Error del servidor:", response.status, responseData);
        showAlert(responseData.message || "Error al actualizar el estado de la prenda", "error");
      }
    } catch (error) {
      console.error("💥 Error al actualizar:", error);
      if (error.message.includes("Failed to fetch")) {
        showAlert("Error: No se puede conectar al servidor. Verifique que esté ejecutándose.", "error");
      } else {
        showAlert(`Error de conexión: ${error.message}`, "error");
      }
    } finally {
      setUpdateLoading(false);
    }
  };

  // Sistema de alertas mejorado (consistente con Home)
  const showAlert = (message, severity) => {
    setAlert({ open: true, message, severity });
  };

  const handleCloseAlert = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setAlert({ ...alert, open: false });
  };

  // Estilos uniformes para TextField
  const uniformInputStyles = {
    "& .MuiOutlinedInput-root": {
      height: "56px",
    },
    "& .MuiInputBase-input": {
      height: "20px",
      padding: "18px 14px",
    },
  };

  return (
    <>
      <Box
        sx={{
          minHeight: "100vh",
          backgroundColor: "#f5f5f5",
          py: 4,
          px: 2,
        }}
      >
        <Box sx={{ maxWidth: 1200, mx: "auto" }}>
          <Typography
            variant="h3"
            component="h1"
            gutterBottom
            sx={{
              textAlign: "center",
              color: "#1976d2",
              fontWeight: "bold",
              mb: 4,
            }}
          >
            Sistema de Gestión de Prendas Perdidas
          </Typography>

          {/* Sección de Búsqueda */}
          <Paper elevation={6} sx={{ borderRadius: 3, overflow: "hidden", mb: 4 }}>
            <Box
              sx={{
                backgroundColor: "#2e7d32",
                color: "white",
                p: 3,
                display: "flex",
                alignItems: "center",
                gap: 2,
              }}
            >
              <Search fontSize="large" />
              <Typography variant="h5" component="h2" fontWeight="bold">
                Búsqueda de Prendas por RUT
              </Typography>
            </Box>

            <CardContent sx={{ p: 4 }}>
              <Grid container spacing={3} alignItems="center">
                <Grid item xs={12} md={8}>
                  <TextField
                    fullWidth
                    label="Buscar por RUT"
                    value={searchRut}
                    onChange={(e) => setSearchRut(e.target.value)}
                    variant="outlined"
                    sx={uniformInputStyles}
                    disabled={searchLoading}
                    placeholder="Ej: 12.345.678-9"
                    InputProps={{
                      endAdornment: searchRut && (
                        <InputAdornment position="end">
                          <IconButton onClick={handleClearSearch} edge="end" disabled={searchLoading}>
                            <Clear />
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleSearch();
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <Button
                    fullWidth
                    variant="contained"
                    color="primary"
                    onClick={handleSearch}
                    disabled={searchLoading}
                    sx={{ 
                      height: 56,
                      fontSize: "1.1rem",
                      fontWeight: "bold"
                    }}
                    startIcon={searchLoading ? <CircularProgress size={20} color="inherit" /> : <Search />}
                  >
                    {searchLoading ? "Buscando..." : "Buscar"}
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Paper>

          {/* Tabla de Resultados */}
          {searchPerformed && (
            <Paper elevation={6} sx={{ borderRadius: 3, overflow: "hidden", mb: 4 }}>
              <Box
                sx={{
                  backgroundColor: "#ed6c02",
                  color: "white",
                  p: 3,
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                }}
              >
                <LocalOffer fontSize="large" />
                <Typography variant="h5" component="h2" fontWeight="bold">
                  Resultados de Búsqueda
                </Typography>
                <Chip 
                  label={`${searchResults.length} prenda(s) encontrada(s)`} 
                  sx={{ color: "white", backgroundColor: "rgba(255,255,255,0.2)", fontWeight: "bold" }} 
                />
              </Box>

              <CardContent sx={{ p: 4 }}>
                {searchLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 4 }}>
                    <CircularProgress size={40} />
                    <Typography variant="h6" sx={{ ml: 2 }}>Buscando prendas...</Typography>
                  </Box>
                ) : searchResults.length > 0 ? (
                  <TableContainer component={Paper} variant="outlined">
                    <Table sx={{ minWidth: 650 }} aria-label="tabla de resultados">
                      <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Nombre</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>RUT</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Teléfono</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Tipo de Prenda</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Talla</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Estado</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Estado Actual</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Acciones</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {searchResults.map((row) => (
                          <TableRow
                            key={row.id}
                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                          >
                            <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                              {row.id}
                            </TableCell>
                            <TableCell>{row.nombre}</TableCell>
                            <TableCell>{row.rut}</TableCell>
                            <TableCell>{row.telefono}</TableCell>
                            <TableCell>{row.tipo_prenda}</TableCell>
                            <TableCell>
                              <Chip label={row.talla} size="small" variant="outlined" />
                            </TableCell>
                            <TableCell>
                              <Chip 
                                label={row.estado} 
                                size="small" 
                                color={
                                  row.estado === "Excelente" ? "success" : 
                                  row.estado === "Bueno" ? "primary" : 
                                  row.estado === "Regular" ? "warning" : "error"
                                }
                              />
                            </TableCell>
                            <TableCell>
                              <Chip 
                                label={row.estado_devolucion || "No registrado"} 
                                size="small" 
                                color={
                                  row.estado_devolucion === "Devuelta al propietario" ? "success" : 
                                  row.estado_devolucion === "Encontrada - Pendiente de devolución" ? "info" : 
                                  row.estado_devolucion === "No reclamada - En bodega" ? "warning" : 
                                  row.estado_devolucion === "Donada" ? "secondary" : 
                                  row.estado_devolucion === "Desechada" ? "error" : "default"
                                }
                                variant={row.estado_devolucion ? "filled" : "outlined"}
                              />
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="outlined"
                                color="primary"
                                size="small"
                                onClick={() => handleOpenReturnDialog(row)}
                                startIcon={<Check />}
                                sx={{ fontWeight: "bold" }}
                              >
                                Actualizar Estado
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Box sx={{ textAlign: 'center', p: 4 }}>
                    <Typography variant="h6" color="textSecondary">
                      No se encontraron prendas para el RUT especificado
                    </Typography>
                    <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                      Verifique que el RUT esté correcto o intente con otro RUT
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Paper>
          )}

          {/* Diálogo de confirmación de devolución */}
          <Dialog open={confirmDialogOpen} onClose={handleCloseReturnDialog} maxWidth="sm" fullWidth>
            <DialogTitle>
              <Typography variant="h6" component="div" sx={{ fontWeight: "bold", color: "#1976d2" }}>
                Actualizar Estado de Prenda
              </Typography>
            </DialogTitle>
            <DialogContent>
              <Box sx={{ mt: 2 }}>
                <Alert severity="info" sx={{ mb: 3 }}>
                  <AlertTitle>Información de la Prenda</AlertTitle>
                  <Typography variant="body2">
                    <strong>ID:</strong> {selectedGarment?.id} | 
                    <strong> Tipo:</strong> {selectedGarment?.tipo_prenda} | 
                    <strong> Talla:</strong> {selectedGarment?.talla}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Propietario:</strong> {selectedGarment?.nombre} (RUT: {selectedGarment?.rut})
                  </Typography>
                </Alert>
                
                <TextField
                  select
                  fullWidth
                  label="Seleccione el nuevo estado"
                  value={returnStatus}
                  onChange={(e) => setReturnStatus(e.target.value)}
                  sx={{ mt: 2 }}
                  disabled={updateLoading}
                >
                  {RETURN_STATUSES.map((status) => (
                    <MenuItem key={status} value={status}>
                      {status}
                    </MenuItem>
                  ))}
                </TextField>

                {returnStatus && (
                  <Alert severity="warning" sx={{ mt: 2 }}>
                    <AlertTitle>Confirmar Cambio</AlertTitle>
                    La prenda cambiará su estado a: <strong>"{returnStatus}"</strong>
                  </Alert>
                )}
              </Box>
            </DialogContent>
            <DialogActions sx={{ p: 3 }}>
              <Button 
                onClick={handleCloseReturnDialog} 
                startIcon={<Close />}
                disabled={updateLoading}
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleConfirmReturn} 
                variant="contained" 
                disabled={!returnStatus || updateLoading}
                startIcon={updateLoading ? <CircularProgress size={18} color="inherit" /> : <Check />}
                sx={{ minWidth: 160 }}
              >
                {updateLoading ? "Actualizando..." : "Confirmar Estado"}
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      </Box>

      {/* Loading Backdrop para actualizaciones */}
      <Backdrop
        sx={{
          color: '#fff',
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backdropFilter: 'blur(4px)',
        }}
        open={updateLoading}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <CircularProgress 
            size={60} 
            color="inherit" 
            sx={{
              '& .MuiCircularProgress-circle': {
                strokeLinecap: 'round',
              },
            }}
          />
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            Actualizando estado...
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.8 }}>
            Por favor espere un momento
          </Typography>
        </Box>
      </Backdrop>

      {/* Snackbar para Alertas */}
      <Snackbar
        open={alert.open}
        autoHideDuration={6000}
        onClose={handleCloseAlert}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
      >
        <Alert
          onClose={handleCloseAlert}
          severity={alert.severity}
          variant="filled"
          sx={{
            width: '100%',
            minWidth: '350px',
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
          }}
        >
          <AlertTitle sx={{ fontWeight: 'bold' }}>
            {alert.severity === 'success' && '¡Éxito!'}
            {alert.severity === 'error' && 'Error'}
            {alert.severity === 'warning' && 'Advertencia'}
            {alert.severity === 'info' && 'Información'}
          </AlertTitle>
          {alert.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default IngresoPrendaPerdida;