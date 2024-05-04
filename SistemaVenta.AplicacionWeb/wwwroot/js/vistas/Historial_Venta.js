let productoData = "";
let cliente = "";
let dataCliente = "";
let negocioData = "";

const VISTA_BUSQUEDA = {

    busquedaFecha: () => {

        $("#txtFechaInicio").val("")
        $("#txtFechaFin").val("")
        $("#txtNumeroVenta").val("")

        $(".busqueda-fecha").show()
        $(".busqueda-venta").hide()
    }, busquedaVenta: () => {

        $("#txtFechaInicio").val("")
        $("#txtFechaFin").val("")
        $("#txtNumeroVenta").val("")

        $(".busqueda-fecha").hide()
        $(".busqueda-venta").show()
    }
}

$(document).ready(function () {
    VISTA_BUSQUEDA["busquedaFecha"]()

    $.datepicker.setDefaults($.datepicker.regional["es"])

    $("#txtFechaInicio").datepicker({ dateFormat: "dd/mm/yy" })
    $("#txtFechaFin").datepicker({ dateFormat: "dd/mm/yy" })

})

$("#cboBuscarPor").change(function () {

    if ($("#cboBuscarPor").val() == "fecha") {
        VISTA_BUSQUEDA["busquedaFecha"]()
    } else {
        VISTA_BUSQUEDA["busquedaVenta"]()
    }

})


$("#btnBuscar").click(function () {

    if ($("#cboBuscarPor").val() == "fecha") {

        if ($("#txtFechaInicio").val().trim() == "" || $("#txtFechaFin").val().trim() == "") {
            toastr.warning("", "Debe ingresar fecha inicio y fin")
            return;
        }
    } else {

        if ($("#txtNumeroVenta").val().trim() == "") {
            toastr.warning("", "Debe ingresar el numero de venta")
            return;
        }
    }

    let numeroVenta = $("#txtNumeroVenta").val()
    let fechaInicio = $("#txtFechaInicio").val()
    let fechaFin = $("#txtFechaFin").val()


    $(".card-body").find("div.row").LoadingOverlay("show");

    fetch(`/Venta/Historial?numeroVenta=${numeroVenta}&fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`)
        .then(response => {
            $(".card-body").find("div.row").LoadingOverlay("hide");
            return response.ok ? response.json() : Promise.reject(response);
        })
        .then(responseJson => {

            $("#tbventa tbody").html("");

            if (responseJson.length > 0) {
                
                responseJson.forEach((venta) => {

                    $("#tbventa tbody").append(
                        $("<tr>").append(
                            $("<td>").text(venta.fechaRegistro),
                            $("<td>").text(venta.idCliente),
                            $("<td>").text(venta.numeroVenta),
                            $("<td>").text(venta.tipoDocumentoVenta),
                            //$("<td>").text(venta.documentoCliente),
                            //$("<td>").text(venta.nombreCliente),
                            $("<td>").text(venta.total),
                            $("<td>").append(
                                $("<button>").addClass("btn btn-info btn-sm").append(
                                    $("<i>").addClass("fas fa-eye")
                                ).data("venta", venta)
                            )
                        )
                    )

                })

            }

        })

})

$("#tbventa tbody").on("click", ".btn-info", function () {
    
    /*AQUI ESTA SE OBTIENE TODA LA VENTA*/
    let d = $(this).data("venta");
    console.log("Datos de venta:", d.detalleVenta)

    fetch("/Cliente/ObtenerPorId?clienteId=" + d.idCliente)
        .then(response => response.json()) 
        .then(data => {
            cliente = data.data; 
            /*console.log("Datos del cliente:", cliente)*/
            dataCliente = cliente;


            $("#txtFechaRegistro").val(d.fechaRegistro)
            $("#txtNumVenta").val(d.numeroVenta)
            $("#txtUsuarioRegistro").val(d.usuario)
            $("#txtTipoDocumento").val(d.tipoDocumentoVenta)
            $("#txtCliente").val(cliente.nombre)
            $("#txtRFC").val(cliente.rfc)
            $("#txtSubTotal").val(d.subTotal)
            $("#txtIGV").val(d.impuestoTotal)
            $("#txtTotal").val(d.total)

            $("#tbProductos tbody").html("");

            d.detalleVenta.forEach((item) => {

                $("#tbProductos tbody").append(
                    $("<tr>").append(
                        $("<td>").text(item.idProducto + "-" + item.descripcionProducto),
                        $("<td>").text(item.cantidad),
                        $("<td>").text(item.precio),
                        $("<td>").text(item.total),
                    )
                )
                buscarProducto(item.idProducto);
            })

            
            $("#modalData").modal("show");
            $("#linkImprimir").attr("href", `/Venta/MostrarPDFVenta?numeroVenta=${d.numeroVenta}`)

        })
        .catch(error => {
            console.error('Error:', error);
        });
})


async function buscarProducto(idProducto) {
    try {
        const response = await fetch("/Producto/ObtenerPorId?idProducto=" + idProducto);
        if (!response.ok) {
            throw new Error('Error al obtener datos del producto');
        }
        const dataProductoResponse = await response.json();
        const dataProducto = dataProductoResponse.data;
        console.log("dataProducto Devuelve lo sig:",dataProducto);
        return dataProducto;
    } catch (error) {
        console.error('Error:', error);
        // Maneja el error según sea necesario
        return null; // O devuelve algún valor por defecto
    }
}

function obtenerInfoNegocio() {
    return fetch("/Negocio/Obtener")
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al obtener datos del negocio');
            }
            $(".card-body").LoadingOverlay("hide");
            return response.json();
        })
        .then(responseJson => {
            if (responseJson.estado) {
                negocioData = responseJson.objeto;
            } else {
                swal("Lo sentimos", responseJson.mensaje, "error");
            }
        })
        .catch(error => {
            console.error('Error:', error);
            // Agrega manejo de errores más específico según sea necesario
        });
}