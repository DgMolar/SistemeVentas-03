namespace SistemaVenta.AplicacionWeb.Models.ViewModels
{
    public class VMCliente
    {
        public int idCliente { get; set; }
        public string? nombre { get; set; }
        public string? correo { get; set; }
        public string? rfc { get; set; }
        public string? domicilioFiscalReceptor { get; set; }
        public string? regimenFiscalReceptor { get; set; }
        public int? esActivo { get; set; }
        public DateTime? fechaRegistro { get; set; }
    }
}