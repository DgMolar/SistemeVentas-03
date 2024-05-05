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
                    // Devolver el archivo ZIP como un flujo de datos al JavaScript
                    return File(resultadoTimbradoBytes, "application/zip", "FacturaTimbrada.zip");
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
