using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;


using Microsoft.EntityFrameworkCore;
using System.Net;
using System.Text;
using SistemaVenta.BLL.Interfaces;
using SistemaVenta.DAL.Interfaces;
using SistemaVenta.Entity;

namespace SistemaVenta.BLL.Implementacion
{
    public class ClienteService : IClienteService
    {
        private readonly IGenericRepository<Cliente> _repositorio;

        public ClienteService(
            IGenericRepository<Cliente> repositorio
            )
        {
            _repositorio = repositorio;
        }
        public async Task<Cliente> Crear(Cliente entidad)
        {

            Cliente cliente_existe = await _repositorio.Obtener(c => c.rfc == entidad.rfc);

            if (cliente_existe != null)
                throw new TaskCanceledException("El ciente (RFC) ya existe");


            try
            {

                Cliente cliente_creado = await _repositorio.Crear(entidad);

                if (cliente_creado.idCliente == 0)
                    throw new TaskCanceledException("No se pudo crear el Cliente");

                IQueryable<Cliente> query = await _repositorio.Consultar(c => c.idCliente == cliente_creado.idCliente);
                cliente_creado = query.First();

                return cliente_creado;
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex);
                throw;
            }
        }

        public async Task<Cliente> Editar(Cliente entidad)
        {
            Cliente cliente_existe = await _repositorio.Obtener(u => u.correo == entidad.correo && u.idCliente != entidad.idCliente);

            if (cliente_existe != null)
                throw new TaskCanceledException("El correo ya existe");


            try
            {

                IQueryable<Cliente> queryCliente = await _repositorio.Consultar(c => c.idCliente == entidad.idCliente);

                Cliente cliente_editar = queryCliente.First();

                cliente_editar.nombre = entidad.nombre;
                cliente_editar.correo = entidad.correo;
                cliente_editar.rfc = entidad.rfc;
                cliente_editar.domicilioFiscalReceptor = entidad.domicilioFiscalReceptor;
                cliente_editar.esActivo = entidad.esActivo;
                cliente_editar.regimenFiscalReceptor = entidad.regimenFiscalReceptor;


                bool respuesta = await _repositorio.Editar(cliente_editar);

                if (!respuesta)
                    throw new TaskCanceledException("No se pudo modificar el Cliente:(");

                Cliente cliente_editado = queryCliente.First();

                return cliente_editado;

            }
            catch
            {
                throw;
            }
        }

        public async Task<bool> Eliminar(int idCliente)
        {
            try
            {
                Cliente cliente_encontrado = await _repositorio.Obtener(u => u.idCliente == idCliente);

                if (cliente_encontrado == null)
                    throw new TaskCanceledException("El cliente no existe");

                
                bool respuesta = await _repositorio.Eliminar(cliente_encontrado);

                return true;

            }
            catch
            {
                throw;
            }
        }

        public async Task<List<Cliente>> Lista()
        {
            IQueryable<Cliente> query = await _repositorio.Consultar();
            return query.ToList();
        }

        public  async Task<Cliente> ObtenerPorId(int idCliente)
        {
            IQueryable<Cliente> query = await _repositorio.Consultar(u => u.idCliente == idCliente);

            Cliente cliente = query.FirstOrDefault();

            return cliente;

            
        }
    }
}
