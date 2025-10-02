import React, { useState } from "react";
import {
  Button,
  TextField,
  Box,
  Typography,
  Grid,
  Alert,
  Paper,
  Chip,
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
  Backdrop,
  CardContent
} from "@mui/material";
import { Search, Clear, Check, Close, LocalOffer } from "@mui/icons-material";
import axios from "axios";

const IngresoPrendaPerdida = () => {
  const API_BASE_URL = import.meta.env.VITE_URL_API || 'https://lostandfoundapi-kfe8.onrender.com';
  
  const [alert, setAlert] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const [searchRut, setSearchRut] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);
  
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [selectedGarment, setSelectedGarment] = useState(null);
  const [returnStatus, setReturnStatus] = useState("");
  const [updateLoading, setUpdateLoading] = useState(false);

  const RETURN_STATUSES = [
    "Encontrada - Pendiente de devolución",
    "Devuelta al propietario",
    "No reclamada - En bodega",
    "Donada",
    "Desechada"
  ];

  // ✅ ACTUALIZADO: Usar la nueva ruta /api/buscar
  const handleSearch = async () => {
    if (!searchRut.trim()) {
      showAlert("Por favor ingrese un RUT para buscar", "error");
      return;
    }
  
    setSearchLoading(true);
    setSearchPerformed(true);
  
    try {
      console.log("🔍 Buscando con nueva ruta...");
      console.log("📋 RUT:", searchRut);
      console.log("🔗 Endpoint:", `${API_BASE_URL}/api/buscar`);
      
      // ✅ CAMBIO PRINCIPAL: Nueva ruta de búsqueda
      const response = await axios.get(`${API_BASE_URL}/api/buscar`, {
        params: {
          rut: searchRut
        },
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log("✅ Respuesta:", response.data);
      
      // La nueva API devuelve { message, count, rut, data }
      const results = response.data.data || [];
      setSearchResults(results);
      
      if (results.length === 0) {
        showAlert(response.data.message || "No se encontraron prendas", "info");
      } else {
        showAlert(`Se encontraron ${results.length} prenda(s) para el RUT ${searchRut}`, "success");
      }
      
    } catch (error) {
      console.error("💥 Error en búsqueda:", error);
      
      let errorMessage = "Error en la búsqueda";
      
      if (error.code === 'ECONNABORTED') {
        errorMessage = "La búsqueda tardó demasiado. Intente nuevamente.";
      } else if (error.response) {
        console.error("📡 Error del servidor:", error.response.data);
        
        switch (error.response.status) {
          case 404:
            errorMessage = "Endpoint no encontrado. Verifique la configuración del servidor.";
            break;
          case 500:
            errorMessage = "Error interno del servidor";
            break;
          case 400:
            errorMessage = error.response.data.message || "Solicitud inválida. Verifique el RUT";
            break;
          default:
            errorMessage = `Error del servidor: ${error.response.status}`;
        }
      } else if (error.request) {
        errorMessage = "No se pudo conectar con el servidor. Verifique su conexión.";
      } else {
        errorMessage = `Error: ${error.message}`;
      }
      
      showAlert(errorMessage, "error");
      setSearchResults([]);
      
    } finally {
      setSearchLoading(false);
    }
  };

  const handleClearSearch = () => {
    setSearchRut("");
    setSearchResults([]);
    setSearchPerformed(false);
    showAlert("Búsqueda limpiada", "info");
  };

  const handleOpenReturnDialog = (garment) => {
    setSelectedGarment(garment);
    setReturnStatus(garment.estado_devolucion || "");
    setConfirmDialogOpen(true);
  };

  const handleCloseReturnDialog = () => {
    setConfirmDialogOpen(false);
    setSelectedGarment(null);
    setReturnStatus("");
    setUpdateLoading(false);
  };

  // ✅ ACTUALIZADO: Usar el endpoint correcto PATCH /api/prendas/:id/estado
  const handleConfirmReturn = async () => {
    if (!selectedGarment || !returnStatus) {
      showAlert("Por favor seleccione un estado válido", "warning");
      return;
    }
    
    setUpdateLoading(true);
    
    try {
      console.log("🔄 Actualizando estado de prenda ID:", selectedGarment.id);
      console.log("📊 Nuevo estado:", returnStatus);
      
      // ✅ CAMBIO: Usar el endpoint correcto con PATCH
      const response = await axios.patch(
        `${API_BASE_URL}/api/prendas/${selectedGarment.id}/estado`,
        { estado_devolucion: returnStatus },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 30000
        }
      );

      console.log("✅ Respuesta de actualización:", response.data);

      // Actualizar el estado local
      setSearchResults(prev => 
        prev.map(item => 
          item.id === selectedGarment.id 
            ? { 
                ...item, 
                estado_devolucion: returnStatus,
                fecha_devolucion: new Date().toISOString()
              } 
            : item
        )
      );
      
      // Mensaje de éxito
      const mensaje = response.data.message || `Estado actualizado a: "${returnStatus}"`;
      showAlert(mensaje, "success");
      
      // Mostrar info del email si está disponible
      if (response.data.emailStatus) {
        console.log("📧 Estado del email:", response.data.emailStatus);
        if (response.data.emailStatus.sent) {
          console.log("✅ Email enviado correctamente");
        } else {
          console.log("⚠️ Email no enviado:", response.data.emailStatus.reason);
        }
      }
      
      setTimeout(() => {
        handleCloseReturnDialog();
      }, 500);
      
    } catch (error) {
      console.error("💥 Error al actualizar:", error);
      
      let errorMessage = "Error al actualizar el estado";
      
      if (error.response) {
        console.error("📡 Error del servidor:", error.response.data);
        errorMessage = error.response.data.message || errorMessage;
      } else if (error.request) {
        errorMessage = "No se pudo conectar con el servidor";
      } else {
        errorMessage = error.message;
      }
      
      showAlert(errorMessage, "error");
    } finally {
      setUpdateLoading(false);
    }
  };

  const showAlert = (message, severity) => {
    setAlert({ open: true, message, severity });
  };

  const handleCloseAlert = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setAlert({ ...alert, open: false });
  };

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
                backgroundColor: "#1976d2",
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
                    placeholder="12345678-9"
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
                  backgroundColor: "#1976d2",
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
                    <Table sx={{ minWidth: 650 }}>
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
                          <TableRow key={row.id}>
                            <TableCell sx={{ fontWeight: 'bold' }}>{row.id}</TableCell>
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

          {/* Diálogo de confirmación */}
          <Dialog open={confirmDialogOpen} onClose={handleCloseReturnDialog} maxWidth="sm" fullWidth>
            <DialogTitle>
              <Typography variant="h6" sx={{ fontWeight: "bold", color: "#1976d2" }}>
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

      {/* Loading Backdrop */}
      <Backdrop
        sx={{
          color: '#fff',
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backdropFilter: 'blur(4px)',
        }}
        open={updateLoading}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <CircularProgress size={60} color="inherit" />
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            Actualizando estado...
          </Typography>
        </Box>
      </Backdrop>

      {/* Snackbar */}
      <Snackbar
        open={alert.open}
        autoHideDuration={6000}
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseAlert}
          severity={alert.severity}
          variant="filled"
          sx={{ width: '100%', minWidth: '350px', borderRadius: 2 }}
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