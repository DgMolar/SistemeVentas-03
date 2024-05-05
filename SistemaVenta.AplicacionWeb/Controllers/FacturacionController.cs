using Microsoft.AspNetCore.Mvc;
using System;
using System.IO;
using System.Threading.Tasks;
using TimbradoService; // Agregar esta directiva

namespace SistemaVenta.AplicacionWeb.Controllers
{
    public class FacturacionController : Controller
    {
        // Acción para mostrar la vista de facturación
        public IActionResult Index()
        {
            return View();
        }

        // Acción para manejar la solicitud de facturación
        [HttpPost]
        public async Task<IActionResult> Facturar([FromBody] string xmlGenerado)
        {
            try
            {
                // Llamar al método del servicio web
                string user = "FIME";
                string password = "s9%4ns7q#eGq";

                // Crear una instancia del cliente del servicio web
                var client = new TimbradoSoapClient(TimbradoSoapClient.EndpointConfiguration.TimbradoSoap);

                // Llamar al método del servicio web y procesar la respuesta
                TimbradoService.TimbrarFResponse response = await client.TimbrarFAsync(user, password, xmlGenerado);

                // Obtener los bytes de la respuesta
                byte[] resultadoTimbradoBytes = response.Body.TimbrarFResult;

                // Procesar la respuesta cuando es exitosa
                if (resultadoTimbradoBytes != null && resultadoTimbradoBytes.Length > 0)
                {
                    // Crear un directorio para almacenar los archivos
                    string directorioSalida = @"C:\Users\diego\Downloads\FacturasTimbradas"; // Cambia esta ruta según tu necesidad
                    Directory.CreateDirectory(directorioSalida);

                    // Guardar el archivo ZIP en disco
                    string archivoZip = Path.Combine(directorioSalida, "FacturaTimbrada.zip");
                    await System.IO.File.WriteAllBytesAsync(archivoZip, resultadoTimbradoBytes);

                    // Devolver una respuesta de éxito si todo salió bien
                    return Ok();
                }
                else
                {
                    return StatusCode(500, "El servicio web devolvió una respuesta vacía.");
                }
            }
            catch (Exception ex)
            {
                // Manejar errores y devolver una respuesta de error
                return StatusCode(500, $"Error al llamar al servicio web: {ex.Message}");
            }
        }
    }
}
