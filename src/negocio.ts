// Datos del negocio ficticio que usa la IA para responder.
// Para adaptar el demo a un cliente real, se reemplaza este archivo con su información.

export const NEGOCIO = {
  nombre: "Mates del Sur (demo)",
  rubro: "tienda online de mates, bombillas y yerbas",
  firma: "Equipo de Mates del Sur",
  tono: "cálido, cercano y profesional; tuteo rioplatense (vos)",
  informacion: `
ENVÍOS
- CABA y GBA: 24 a 48 h hábiles. Interior del país: 3 a 7 días hábiles por correo.
- Envío gratis en compras desde ARS 50.000. Si no, el costo se calcula en el checkout.
- El número de seguimiento se envía por email cuando el pedido se despacha.

CAMBIOS Y DEVOLUCIONES
- Cambios dentro de los 30 días, con el producto sin uso y en su empaque.
- Productos fallados: se cambian sin costo; pedimos una foto del defecto.
- Devoluciones de dinero: solo por productos fallados o pedidos que nunca llegaron, y siempre las aprueba una persona del equipo.

MEDIOS DE PAGO
- Tarjeta de crédito (hasta 3 cuotas sin interés), débito, transferencia (10% de descuento) y Mercado Pago.

PRODUCTOS
- Mates de calabaza, algarrobo y cerámica. Bombillas de alpaca con 6 meses de garantía.
- Yerbas de 500 g y 1 kg. Ventas mayoristas: desde 20 unidades, con lista de precios aparte.

ATENCIÓN
- Lunes a viernes de 9 a 18 h. Respondemos emails en menos de 24 h hábiles.
`.trim(),
} as const;
