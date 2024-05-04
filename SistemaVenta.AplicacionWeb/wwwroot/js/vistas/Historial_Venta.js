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

            /*$("#linkFacturar").attr("href", `/Facturacion/Index?numeroVenta=${d.numeroVenta}`)*/

            document.getElementById("linkFacturar").addEventListener("click", async () => {
                let datos = "";
                try {
                    await obtenerInfoNegocio(); // Asumiendo que esta función devuelve la info del negocio

                    datos = {
                        Venta: {
                        idLocal: d.numeroVenta,
                        version: "4.0",
                        folio: "01",
                        formaPago: "01",
                        subTotal: d.subTotal,
                        descuento: d.descuento,
                        moneda: negocioData.simboloMoneda,
                        tipoCambio: "1.0",
                        total: d.total,
                        tipoDeComprobante: "I",
                        metodoPago: "PUE",
                        lugarExpedicion: negocioData.direccion,
                        regimenFiscal: negocioData.telefono,
                        rfc: dataCliente.rfc,
                        nombre: dataCliente.nombre,
                        domicilioFiscalReceptor: dataCliente.domicilioFiscalReceptor,
                        regimenFiscalReceptor: dataCliente.regimenFiscalReceptor,
                        usoCFDI:"S01"

                    },
                        DetalleVenta: [],
                        totalImporteTranslado: "0"
                    };
                    let descuentoProductos = 0;
                    await Promise.all(
                        d.detalleVenta.map(async detalle => {
                            const productoData = await buscarProducto(detalle.idProducto);
                            const descuentoProducto = detalle.precio * detalle.cantidad * (productoData.descuento / 100); // Descuento para el producto individual
                            descuentoProductos += descuentoProducto; // Sumar al descuento total
                            const tasaCuotaa = productoData.valorImpuesto / 100;
                            const detalleVenta = {
                                claveProdServ: productoData.claveProductoSat,
                                noIdentificacion: detalle.idProducto.toString(),
                                cantidad: detalle.cantidad.toString(),
                                claveUnidad: productoData.unidadMedidaSat,
                                unidad: productoData.unidadMedida,
                                descripcion: detalle.descripcionProducto,
                                valorUnitario: detalle.precio.toString(),
                                importe: (detalle.cantidad * detalle.precio).toString(),
                                descuento: descuentoProducto.toString(), // Descuento para el producto individual
                                objetoImp: productoData.objetoImpuesto,
                                base: (detalle.cantidad * detalle.precio).toString(),
                                impuesto: productoData.impuesto,
                                tipoFactor: productoData.factorImpuesto,
                                tasaOCuota: tasaCuotaa,
                                importeTranslado: (((detalle.cantidad * detalle.precio) * productoData.valorImpuesto) / 100).toString(),
                            };

                            datos.DetalleVenta.push(detalleVenta);
                        })
                    );
                    
                    console.log("Descuento total:", descuentoProductos); // Descuento total para todos los productos
                    const totalImporteTranslado = datos.DetalleVenta.reduce((total, detalle) => {
                        return total + parseFloat(detalle.importeTranslado);
                    }, 0);

                    // Asignamos el total al campo correspondiente en datos.Venta
                    console.log(totalImporteTranslado)
                    datos.totalImporteTranslado = totalImporteTranslado.toString();
                    // Aquí se solicitaría el XML
                    let xmlGenerado = generarXML(datos);
                    let datosCFDI = JSON.stringify(xmlGenerado);;
                    console.log(datosCFDI);
                    console.log("El numero de venta es:", d.numeroVenta)
                    // Realizar la solicitud HTTP POST al backend con el XML generado
                    const response = await fetch('/Facturacion/Facturar', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: datosCFDI // Pasar el XML generado como cuerpo de la solicitud
                    });

                    // Verificar el estado de la respuesta
                    if (response.ok) {
                        // La solicitud se realizó con éxito
                        alert("La facturación se realizó correctamente.")
                        console.log('La facturación se realizó correctamente.');
                        location.reload()
                    } else {
                        alert("La facturación NO se realizó correctamente. FAVOR DE VERIFICAR QUE LA VENTA NO SE HAYA FACTURADO ANTERIORMENTE O VERIFIQUE LOS DATOS DEL CLIENTE.")
                        // Hubo un error en la solicitud
                        console.error('Error al intentar facturar:', response.statusText);
                    }
                   
                } catch (error) {
                    console.error(error);
                    // Manejar errores según sea necesario
                }
            });

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

function generarXML(datos) {
    let xml = `<Comprobante>`;
    xml += `<idLocal>FACTURA${datos.Venta.idLocal}</idLocal>`;
    xml += `<version>${datos.Venta.version}</version>`;
    xml += `<serie/>`;
    xml += `<folio>${datos.Venta.folio}</folio>`;
    xml += `<formaPago>${datos.Venta.formaPago}</formaPago>`;
    xml += `<condicionesDePago>CONTADO</condicionesDePago>`;
    xml += `<subTotal>${datos.Venta.subTotal}</subTotal>`;
    xml += `<descuento>${datos.Venta.descuento}</descuento>`;
    xml += `<moneda>${datos.Venta.moneda}</moneda>`;
    xml += `<tipoCambio>${datos.Venta.tipoCambio}</tipoCambio>`;
    xml += `<exportacion>01</exportacion>`;
    xml += `<total>${datos.Venta.total}</total>`;
    xml += `<tipoDeComprobante>${datos.Venta.tipoDeComprobante}</tipoDeComprobante>`;
    xml += `<metodoPago>${datos.Venta.metodoPago}</metodoPago>`;
    xml += `<lugarExpedicion>${datos.Venta.lugarExpedicion}</lugarExpedicion>`;
    xml += `<confirmacion></confirmacion>`;
    xml += `<Relacionado/>`;
    xml += `<regimenFiscal>${datos.Venta.regimenFiscal}</regimenFiscal>`;
    xml += `<rfc>${datos.Venta.rfc}</rfc>`;
    xml += `<nombre>${datos.Venta.nombre}</nombre>`;
    xml += `<residenciaFiscal></residenciaFiscal>`;
    xml += `<numRegIdTrib></numRegIdTrib>`;
    xml += `<domicilioFiscalReceptor>${datos.Venta.domicilioFiscalReceptor}</domicilioFiscalReceptor>`;
    xml += `<regimenFiscalReceptor>${datos.Venta.regimenFiscalReceptor}</regimenFiscalReceptor>`;
    xml += `<usoCFDI>${datos.Venta.usoCFDI}</usoCFDI>`;

    // Agregar cada Concepto dinámicamente (pueden ser múltiples)
    datos.DetalleVenta.forEach(detalle => {
        xml += `<Concepto>`;
        xml += `<claveProdServ>${detalle.claveProdServ}</claveProdServ>`;
        xml += `<noIdentificacion>${detalle.noIdentificacion}</noIdentificacion>`;
        xml += `<cantidad>${detalle.cantidad}</cantidad>`;
        xml += `<claveUnidad>${detalle.claveUnidad}</claveUnidad>`;
        xml += `<unidad>${detalle.unidad}</unidad>`;
        xml += `<descripcion>${detalle.descripcion}</descripcion>`;
        xml += `<valorUnitario>${detalle.valorUnitario}</valorUnitario>`;
        xml += `<importe>${detalle.importe}</importe>`;
        xml += `<descuento>${detalle.descuento}</descuento>`;
        xml += `<objetoImp>${detalle.objetoImp}</objetoImp>`;
        xml += `<Traslado>`;
        xml += `<base>${detalle.base}</base>`;
        xml += `<impuesto>${detalle.impuesto}</impuesto>`;
        xml += `<tipoFactor>${detalle.tipoFactor}</tipoFactor>`;
        xml += `<tasaOCuota>${detalle.tasaOCuota}</tasaOCuota>`;
        xml += `<importe>${detalle.importeTranslado}</importe>`;
        xml += `</Traslado>`;
        xml += `</Concepto>`;
    });

    xml += `<totalImpuestosTrasladados>${datos.totalImporteTranslado}</totalImpuestosTrasladados>`;
    xml += `</Comprobante>`;

    return xml;
}

//function generarXML(datos) {
//    let xml = `<Comprobante>\n`;
//    xml += `\t<idLocal>${datos.Venta.idLocal}</idLocal>\n`;
//    xml += `\t<version>${datos.Venta.version}</version>\n`;
//    xml += `\t<serie/>\n`;
//    xml += `\t<folio>${datos.Venta.folio}</folio>\n`;
//    xml += `\t<formaPago>${datos.Venta.formaPago}</formaPago>\n`;
//    xml += `\t<condicionesDePago>CONTADO</condicionesDePago>\n`;
//    xml += `\t<subTotal>${datos.Venta.subTotal}</subTotal>\n`;
//    xml += `\t<descuento>${datos.Venta.descuento}</descuento>\n`;
//    xml += `\t<moneda>${datos.Venta.moneda}</moneda>\n`;
//    xml += `\t<tipoCambio>${datos.Venta.tipoCambio}</tipoCambio>\n`;
//    xml += `\t<exportacion>01</exportacion>\n`;
//    xml += `\t<total>${datos.Venta.total}</total>\n`;
//    xml += `\t<tipoDeComprobante>${datos.Venta.tipoDeComprobante}</tipoDeComprobante>\n`;
//    xml += `\t<metodoPago>${datos.Venta.metodoPago}</metodoPago>\n`;
//    xml += `\t<lugarExpedicion>${datos.Venta.lugarExpedicion}</lugarExpedicion>\n`;
//    xml += `\t<confirmacion></confirmacion>\n`;
//    xml += `\t<Relacionado/>\n`;
//    xml += `\t<regimenFiscal>${datos.Venta.regimenFiscal}</regimenFiscal>\n`;
//    xml += `\t<rfc>${datos.Venta.rfc}</rfc>\n`;
//    xml += `\t<nombre>${datos.Venta.nombre}</nombre>\n`;
//    xml += `\t<residenciaFiscal></residenciaFiscal>\n`;
//    xml += `\t<numRegIdTrib></numRegIdTrib>\n`;
//    xml += `\t<domicilioFiscalReceptor>${datos.Venta.domicilioFiscalReceptor}</domicilioFiscalReceptor>\n`;
//    xml += `\t<regimenFiscalReceptor>${datos.Venta.regimenFiscalReceptor}</regimenFiscalReceptor>\n`;
//    xml += `\t<usoCFDI>${datos.Venta.usoCFDI}</usoCFDI>\n`;

//    // Agregar cada Concepto dinámicamente (pueden ser múltiples)
//    datos.DetalleVenta.forEach(detalle => {
//        xml += `\t<Concepto>\n`;
//        xml += `\t\t<claveProdServ>${detalle.claveProdServ}</claveProdServ>\n`;
//        xml += `\t\t<noIdentificacion>${detalle.noIdentificacion}</noIdentificacion>\n`;
//        xml += `\t\t<cantidad>${detalle.cantidad}</cantidad>\n`;
//        xml += `\t\t<claveUnidad>${detalle.claveUnidad}</claveUnidad>\n`;
//        xml += `\t\t<unidad>${detalle.unidad}</unidad>\n`;
//        xml += `\t\t<descripcion>${detalle.descripcion}</descripcion>\n`;
//        xml += `\t\t<valorUnitario>${detalle.valorUnitario}</valorUnitario>\n`;
//        xml += `\t\t<importe>${detalle.importe}</importe>\n`;
//        xml += `\t\t<descuento>${detalle.descuento}</descuento>\n`;
//        xml += `\t\t<objetoImp>${detalle.objetoImp}</objetoImp>\n`;
//        xml += `\t\t<Traslado>\n`;
//        xml += `\t\t\t<base>${detalle.base}</base>\n`;
//        xml += `\t\t\t<impuesto>${detalle.impuesto}</impuesto>\n`;
//        xml += `\t\t\t<tipoFactor>${detalle.tipoFactor}</tipoFactor>\n`;
//        xml += `\t\t\t<tasaOCuota>${detalle.tasaOCuota}</tasaOCuota>\n`;
//        xml += `\t\t\t<importe>${detalle.importeTranslado}</importe>\n`;
//        xml += `\t\t</Traslado>\n`;

//        xml += `\t</Concepto>\n`;
//    });

//    xml += `\t<totalImpuestosTrasladados>${datos.totalImporteTranslado}</totalImpuestosTrasladados>\n`;
//    xml += `</Comprobante>`;

//    return xml;
//}
