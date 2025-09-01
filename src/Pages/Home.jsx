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
  Backdrop,
  Snackbar,
  AlertTitle
} from "@mui/material";
import { Save, Person, LocalOffer, CheckCircle } from "@mui/icons-material";

const Home = () => {
  const [formData, setFormData] = useState({
    nombre: "",
    telefono: "",
    rut: "",
    email: "",
    tipo_prenda: "",
    talla: "",
    estado: "",
    observaciones: "",
  });

  // Cambiamos el estado de alert para usar Snackbar
  const [alert, setAlert] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const [isLoading, setIsLoading] = useState(false);

  const GARMENT_TYPES = [
    "Camisa",
    "Pantalón",
    "Vestido",
    "Falda",
    "Blusa",
    "Chaqueta",
    "Abrigo",
    "Suéter",
    "Zapatos",
    "Camiseta",
    "Uniforme",
    "Zapatilla",
    "Gorro",
    "Lonchera",
  ];

  const SIZES = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];
  const CONDITIONS = ["Excelente", "Bueno", "Regular", "Dañado"];

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Validación mejorada que verifica todos los campos obligatorios
  const isFormValid = useMemo(() => {
    return (
      formData.nombre.trim() !== "" &&
      formData.telefono.trim() !== "" &&
      formData.rut.trim() !== "" &&
      formData.email.trim() !== "" &&
      formData.tipo_prenda.trim() !== "" &&
      formData.talla.trim() !== "" &&
      formData.estado.trim() !== ""
    );
  }, [formData]);

  const handleSave = async () => {
    if (!isFormValid) {
      showAlert("Por favor complete todos los campos obligatorios", "error");
      return;
    }

    setIsLoading(true);

    try {
      // Preparar los datos para enviar
      const dataToSend = {
        nombre: formData.nombre.trim(),
        rut: formData.rut.trim(),
        email: formData.email.trim(),
        tipo_prenda: formData.tipo_prenda,
        telefono: formData.telefono.trim(),
        talla: formData.talla,
        estado: formData.estado,
        observaciones: formData.observaciones.trim()
      };

      console.log("🚀 Enviando datos a:", 'http://localhost:8000/prendas');
      console.log("📦 Datos:", dataToSend);

      // Realizar la petición POST a tu API
      const response = await fetch('http://localhost:8000/prendas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend)
      });

      console.log("📡 Respuesta recibida:", response.status, response.statusText);
      
      // Obtener el texto de la respuesta
      const responseText = await response.text();
      console.log("📄 Texto de respuesta:", responseText);
      
      let result;
      try {
        result = JSON.parse(responseText);
      } catch (e) {
        console.error("❌ Error parseando JSON:", e);
        throw new Error(`Respuesta no es JSON válido: ${responseText}`);
      }

      if (response.ok) {
        // Éxito
        showAlert(`¡Prenda registrada exitosamente! ID: ${result.id}`, "success");
        
        // Resetear el formulario
        setFormData({
          nombre: "",
          telefono: "",
          rut: "",
          email: "",
          tipo_prenda: "",
          talla: "",
          estado: "",
          observaciones: "",
        });
      } else {
        // Error del servidor
        console.error("❌ Error del servidor:", response.status, result);
        
        if (response.status === 404) {
          showAlert("Error: La ruta del servidor no fue encontrada. Verifique que el servidor esté configurado correctamente.", "error");
        } else if (response.status === 409) {
          showAlert("Ya existe una prenda similar registrada para este cliente", "warning");
        } else {
          showAlert(result.message || `Error del servidor: ${response.status}`, "error");
        }
      }

    } catch (error) {
      console.error("💥 Error de conexión completo:", error);
      if (error.message.includes("Failed to fetch")) {
        showAlert("Error: No se puede conectar al servidor. Verifique que esté ejecutándose en localhost:8000", "error");
      } else {
        showAlert(`Error de conexión: ${error.message}`, "error");
      }
    } finally {
      setIsLoading(false);
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
        <Box sx={{ maxWidth: 900, mx: "auto" }}>
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
            Sistema de Ingreso de Prendas
          </Typography>

          <Paper elevation={6} sx={{ borderRadius: 3, overflow: "hidden" }}>
            {/* Sección Datos de la Persona */}
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
              <Person fontSize="large" />
              <Typography variant="h5" component="h2" fontWeight="bold">
                Datos de la Persona
              </Typography>
            </Box>

            <CardContent sx={{ p: 4 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Nombre Completo"
                    value={formData.nombre}
                    onChange={(e) =>
                      handleInputChange("nombre", e.target.value)
                    }
                    required
                    variant="outlined"
                    sx={uniformInputStyles}
                    error={formData.nombre.trim() === ""}
                    helperText={formData.nombre.trim() === "" ? "Campo obligatorio" : ""}
                    disabled={isLoading}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="RUT"
                    value={formData.rut}
                    onChange={(e) => handleInputChange("rut", e.target.value)}
                    required
                    variant="outlined"
                    sx={uniformInputStyles}
                    error={formData.rut.trim() === ""}
                    helperText={formData.rut.trim() === "" ? "Campo obligatorio" : ""}
                    disabled={isLoading}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    required
                    label="Teléfono"
                    value={formData.telefono}
                    onChange={(e) =>
                      handleInputChange("telefono", e.target.value)
                    }
                    placeholder="+56 9 1234 5678"
                    variant="outlined"
                    sx={uniformInputStyles}
                    error={formData.telefono.trim() === ""}
                    helperText={formData.telefono.trim() === "" ? "Campo obligatorio" : ""}
                    disabled={isLoading}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    required
                    fullWidth
                    label="Correo Electrónico"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="ejemplo@correo.com"
                    variant="outlined"
                    sx={uniformInputStyles}
                    error={formData.email.trim() === ""}
                    helperText={formData.email.trim() === "" ? "Campo obligatorio" : ""}
                    disabled={isLoading}
                  />
                </Grid>
              </Grid>
            </CardContent>

            {/* Sección Datos de la Prenda */}
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
                Datos de la Prenda
              </Typography>
            </Box>

            <CardContent sx={{ p: 4 }}>
              <Grid container spacing={4}>
                {/* Selector de Tipo de Prenda con Chips */}
                <Grid item xs={12}>
                  <FormLabel
                    component="legend"
                    sx={{
                      fontSize: "1.1rem",
                      fontWeight: "bold",
                      color: "#1976d2",
                      mb: 2,
                      display: "block",
                      opacity: isLoading ? 0.5 : 1,
                    }}
                  >
                    Tipo de Prenda *
                  </FormLabel>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                    {GARMENT_TYPES.map((type) => (
                      <Chip
                        key={type}
                        label={type}
                        clickable={!isLoading}
                        onClick={() => !isLoading && handleInputChange("tipo_prenda", type)}
                        variant={formData.tipo_prenda === type ? "filled" : "outlined"}
                        color={formData.tipo_prenda === type ? "primary" : "default"}
                        icon={formData.tipo_prenda === type ? <CheckCircle /> : null}
                        disabled={isLoading}
                        sx={{
                          height: "40px",
                          fontSize: "1rem",
                          fontWeight: formData.tipo_prenda === type ? "bold" : "normal",
                          opacity: isLoading ? 0.5 : 1,
                          "&:hover": {
                            backgroundColor:
                              formData.tipo_prenda === type ? "#1976d2" : "#e3f2fd",
                          },
                        }}
                      />
                    ))}
                  </Box>
                  {formData.tipo_prenda === "" && (
                    <Typography variant="caption" color="error" sx={{ mt: 1, display: "block" }}>
                      Debe seleccionar un tipo de prenda
                    </Typography>
                  )}
                </Grid>

                {/* Selector de Talla con Toggle Buttons */}
                <Grid item xs={12}>
                  <FormLabel
                    component="legend"
                    sx={{
                      fontSize: "1.1rem",
                      fontWeight: "bold",
                      color: "#1976d2",
                      mb: 2,
                      display: "block",
                      opacity: isLoading ? 0.5 : 1,
                    }}
                  >
                    Talla *
                  </FormLabel>
                  <ToggleButtonGroup
                    value={formData.talla}
                    exclusive
                    onChange={(event, newSize) =>
                      !isLoading && newSize && handleInputChange("talla", newSize)
                    }
                    aria-label="selección de talla"
                    disabled={isLoading}
                    sx={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 1,
                      opacity: isLoading ? 0.5 : 1,
                      "& .MuiToggleButton-root": {
                        minWidth: "80px",
                        height: "48px",
                        fontSize: "1rem",
                        fontWeight: "bold",
                        border: "2px solid #1976d2",
                        borderRadius: "8px",
                        color: "#1976d2",
                        "&.Mui-selected": {
                          backgroundColor: "#1976d2",
                          color: "white",
                          "&:hover": {
                            backgroundColor: "#1565c0",
                          },
                        },
                        "&:hover": {
                          backgroundColor: "#e3f2fd",
                        },
                        "&.Mui-disabled": {
                          opacity: 0.5,
                        },
                      },
                    }}
                  >
                    {SIZES.map((size) => (
                      <ToggleButton key={size} value={size}>
                        {size}
                      </ToggleButton>
                    ))}
                  </ToggleButtonGroup>
                  {formData.talla === "" && (
                    <Typography variant="caption" color="error" sx={{ mt: 1, display: "block" }}>
                      Debe seleccionar una talla
                    </Typography>
                  )}
                </Grid>

                {/* Selector de Condición con Chips coloridos */}
                <Grid item xs={12}>
                  <FormLabel
                    component="legend"
                    sx={{
                      fontSize: "1.1rem",
                      fontWeight: "bold",
                      color: "#1976d2",
                      mb: 2,
                      display: "block",
                      opacity: isLoading ? 0.5 : 1,
                    }}
                  >
                    Estado de la Prenda *
                  </FormLabel>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                    {CONDITIONS.map((condition, index) => {
                      const colors = ["success", "info", "warning", "error"];
                      const isSelected = formData.estado === condition;

                      return (
                        <Chip
                          key={condition}
                          label={condition}
                          clickable={!isLoading}
                          onClick={() =>
                            !isLoading && handleInputChange("estado", condition)
                          }
                          variant={isSelected ? "filled" : "outlined"}
                          color={isSelected ? colors[index] : "default"}
                          icon={isSelected ? <CheckCircle /> : null}
                          disabled={isLoading}
                          sx={{
                            height: "40px",
                            fontSize: "1rem",
                            fontWeight: isSelected ? "bold" : "normal",
                            opacity: isLoading ? 0.5 : 1,
                            "&:hover": {
                              transform: !isLoading ? "scale(1.05)" : "none",
                              transition: "transform 0.2s",
                            },
                          }}
                        />
                      );
                    })}
                  </Box>
                  {formData.estado === "" && (
                    <Typography variant="caption" color="error" sx={{ mt: 1, display: "block" }}>
                      Debe seleccionar el estado de la prenda
                    </Typography>
                  )}
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Observaciones"
                    multiline
                    rows={4}
                    value={formData.observaciones}
                    onChange={(e) =>
                      handleInputChange("observaciones", e.target.value)
                    }
                    placeholder="Detalles adicionales, daños, reparaciones necesarias, etc."
                    variant="outlined"
                    disabled={isLoading}
                    sx={{
                      opacity: isLoading ? 0.5 : 1,
                    }}
                  />
                </Grid>
              </Grid>
            </CardContent>

            <CardActions
              sx={{
                p: 4,
                pt: 0,
                justifyContent: "center",
                backgroundColor: "#fafafa",
              }}
            >
              <Button
                variant="contained"
                size="large"
                startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <Save />}
                onClick={handleSave}
                disabled={!isFormValid || isLoading}
                sx={{
                  py: 2,
                  px: 6,
                  fontSize: "1.2rem",
                  fontWeight: "bold",
                  borderRadius: 3,
                  minHeight: "56px",
                  backgroundColor: isLoading ? "#ff9800" : isFormValid ? "#4caf50" : "#bdbdbd",
                  "&:hover": {
                    backgroundColor: isLoading ? "#f57c00" : isFormValid ? "#45a049" : "#bdbdbd",
                  },
                  "&:disabled": {
                    backgroundColor: isLoading ? "#ff9800" : "#e0e0e0",
                    color: isLoading ? "white" : "#9e9e9e",
                  },
                  transition: "all 0.3s ease",
                  boxShadow: isFormValid && !isLoading ? "0 4px 12px rgba(76, 175, 80, 0.3)" : "none",
                }}
              >
                {isLoading 
                  ? "Guardando..." 
                  : isFormValid 
                  ? "Guardar Prenda" 
                  : "Complete todos los campos"}
              </Button>
            </CardActions>
          </Paper>
        </Box>
      </Box>

      {/* Loading Backdrop */}
      <Backdrop
        sx={{
          color: '#fff',
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backdropFilter: 'blur(4px)',
        }}
        open={isLoading}
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
            Guardando prenda...
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
            minWidth: '300px',
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

export default Home;