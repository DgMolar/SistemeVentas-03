using AutoMapper.Internal.Mappers;

namespace SistemaVenta.AplicacionWeb.Models.ViewModels
{
    public class VMProducto
    {
        public int IdProducto { get; set; }
        public string? CodigoBarra { get; set; }
        public string? Marca { get; set; }
        public string? Descripcion { get; set; }
        public int? IdCategoria { get; set; }
        public string? NombreCategoria { get; set; }
        public int? Stock { get; set; }
        public string? UrlImagen { get; set; }
        public string? Precio { get; set; }
        public int? EsActivo { get; set; }
        public string? unidadMedida { get; set; }
        public string? unidadMedidaSat { get; set; }
        public string? claveProductoSat { get; set; }
        public string? objetoImpuesto { get; set; }
        public string? factorImpuesto { get; set; }
        public string? impuesto { get; set; }
        public decimal? valorImpuesto { get; set; }
        public string? tipoImpuesto { get; set; }
        public decimal? descuento { get; set; }

        // Implementación del método ToString
        public override string ToString()
        {
            return $"IdProducto: {IdProducto}, " +
                   $"CodigoBarra: {CodigoBarra}, " +
                   $"Marca: {Marca}, " +
                   $"Descripcion: {Descripcion}, " +
                   $"IdCategoria: {IdCategoria}, " +
                   $"NombreCategoria: {NombreCategoria}, " +
                   $"Stock: {Stock}, " +
                   $"UrlImagen: {UrlImagen}, " +
                   $"Precio: {Precio}, " +
                   $"EsActivo: {EsActivo}, " +
                   $"UnidadMedida: {unidadMedida}, " +
                   $"UnidadMedidaSat: {unidadMedidaSat}, " +
                   $"ClaveProductoSat: {claveProductoSat}, " +
                   $"ObjetoImpuesto: {objetoImpuesto}, " +
                   $"FactorImpuesto: {factorImpuesto}, " +
                   $"Impuesto: {impuesto}, " +
                   $"ValorImpuesto: {valorImpuesto}, " +
                   $"TipoImpuesto: {tipoImpuesto}, " +
                   $"Descuento: {descuento}";
        }


    }
}
