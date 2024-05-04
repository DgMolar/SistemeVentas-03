using System;
using System.Collections.Generic;

namespace SistemaVenta.Entity
{
    public partial class Producto
    {
        public int IdProducto { get; set; }
        public string? CodigoBarra { get; set; }
        public string? Marca { get; set; }
        public string? Descripcion { get; set; }
        public int? IdCategoria { get; set; }
        public int? Stock { get; set; }
        public string? UrlImagen { get; set; }
        public string? NombreImagen { get; set; }
        public decimal? Precio { get; set; }
        public bool? EsActivo { get; set; }
        public string? unidadMedida { get; set; }
        public string? unidadMedidaSat { get; set; }
        public string? claveProductoSat { get; set; }
        public string? objetoImpuesto { get; set; }
        public string? factorImpuesto { get; set; }
        public string? impuesto { get; set; }
        public decimal? valorImpuesto { get; set; }
        public string? tipoImpuesto { get; set; }
        public decimal? descuento { get; set; }
        
        public DateTime? FechaRegistro { get; set; }

        public virtual Categoria? IdCategoriaNavigation { get; set; }
    }
}
