using System;
using System.Collections.Generic;

namespace SistemaVenta.Entity
{
    public partial class Cliente
    {
        public int idCliente { get; set; }
        public string? nombre { get; set; }
        public string? correo { get; set; }
        public string? rfc { get; set; }
        public string? domicilioFiscalReceptor { get; set; }
        public string? regimenFiscalReceptor{ get; set; }
        public bool? esActivo { get; set; }
        public DateTime? fechaRegistro { get; set; }

    }
}
