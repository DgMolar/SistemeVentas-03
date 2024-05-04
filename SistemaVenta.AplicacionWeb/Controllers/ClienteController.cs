using Microsoft.AspNetCore.Mvc;

using AutoMapper;
using Newtonsoft.Json;
using SistemaVenta.AplicacionWeb.Models.ViewModels;
using SistemaVenta.AplicacionWeb.Utilidades.Response;
using SistemaVenta.BLL.Interfaces;
using SistemaVenta.Entity;
using Microsoft.AspNetCore.Authorization;

namespace SistemaVenta.AplicacionWeb.Controllers
{
    [Authorize]
    public class ClienteController : Controller
    {
        private readonly IClienteService _clienteServicio;
        private readonly IMapper _mapper;
        public ClienteController(
            IClienteService clienteServicio,
            IMapper mapper
            )
        {
            _clienteServicio = clienteServicio;
            _mapper = mapper;

        }
        public IActionResult Index()
        {
            return View();
        }
        [HttpGet]
        public async Task<IActionResult> Lista()
        {
            List<VMCliente> vmClienteLista = _mapper.Map<List<VMCliente>>(await _clienteServicio.Lista());
            return StatusCode(StatusCodes.Status200OK, new { data = vmClienteLista });
        }
        [HttpGet]
        public async Task<IActionResult> ObtenerPorId(int clienteId)
        {
            VMCliente vmClienteLista = _mapper.Map<VMCliente>(await _clienteServicio.ObtenerPorId(clienteId));
            return StatusCode(StatusCodes.Status200OK, new { data = vmClienteLista });

        }

        [HttpPost]
        public async Task<IActionResult> Crear([FromForm] string modelo)
        {

            GenericResponse<VMCliente> gResponse = new GenericResponse<VMCliente>();
           
            try
            {
                VMCliente vmCliente = JsonConvert.DeserializeObject<VMCliente>(modelo);
               

                // Cliente cliente = new Cliente();

                //cliente.idCliente = vmCliente.idCliente;
                //cliente.regimenFiscalReceptor = vmCliente.regimenFiscalReceptor;
                //cliente.domicilioFiscalReceptor = vmCliente.domicilioFiscalReceptor;
                //cliente.esActivo = vmCliente.esActivo;
                //cliente.correo = vmCliente.correo;
                //cliente.rfc = vmCliente.rfc;
                //cliente.nombre = vmCliente.nombre;

                

                



                Cliente cliente_creado = await _clienteServicio.Crear(_mapper.Map<Cliente>(vmCliente));
                //Cliente cliente_creado = await _clienteServicio.Crear(cliente);

                Console.WriteLine("FALLE");

                vmCliente = _mapper.Map<VMCliente>(cliente_creado);

                gResponse.Estado = true;
                gResponse.Objeto = vmCliente;

            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
                gResponse.Estado = false;
                gResponse.Mensaje = ex.Message;
            }

            return StatusCode(StatusCodes.Status200OK, gResponse);

        }

        [HttpPut]
        public async Task<IActionResult> Editar([FromForm] string modelo)
        {
            GenericResponse<VMCliente> gResponse = new GenericResponse<VMCliente>();
            try
            {
                VMCliente vmCliente = JsonConvert.DeserializeObject<VMCliente>(modelo);


                Cliente cliente_editado = await _clienteServicio.Editar(_mapper.Map<Cliente>(vmCliente));

                vmCliente = _mapper.Map<VMCliente>(cliente_editado);

                gResponse.Estado = true;
                gResponse.Objeto = vmCliente;

            }
            catch (Exception ex)
            {
                gResponse.Estado = false;
                gResponse.Mensaje = ex.Message;
            }

            return StatusCode(StatusCodes.Status200OK, gResponse);

        }

        [HttpDelete]
        public async Task<IActionResult> Eliminar(int idCLiente)
        {
            GenericResponse<string> gResponse = new GenericResponse<string>();

            try
            {
                gResponse.Estado = await _clienteServicio.Eliminar(idCLiente);
            }
            catch (Exception ex)
            {
                gResponse.Estado = false;
                gResponse.Mensaje = ex.Message;
            }

            return StatusCode(StatusCodes.Status200OK, gResponse);
        }
    }
}