const { sendMail } = require("./config/mailer");

/**
 * sendHospitalNotification
 * Convenience wrapper to format and send an email to hospital(s) when a patient requests an organ.
 *
 * Parameters:
 * - order: the saved order document (or object) containing _id, address, phone, amount, transactionId
 * - patient: user object with name/email/phoneNumber
 * - products: array of product documents or objects with pName and other fields
 * - recipients: array of email addresses (strings) to send the notification to
 *
 * Returns the result of sendMail (or a logged object if SMTP not configured)
 */
const sendHospitalNotification = async ({ order, patient, products = [], recipients = [] }) => {
	if (!recipients || recipients.length === 0) {
		console.log("[mailsend] No recipients provided for hospital notification. Skipping.");
		return { ok: false, reason: "no-recipients" };
	}

	const subject = `Organ Request — Order ${order._id}`;

	const lines = [];
	lines.push(`<h2>New Organ Request - Order ${order._id}</h2>`);
	lines.push(`<p><strong>Patient:</strong> ${patient ? patient.name : "Unknown"} &lt;${patient ? patient.email : ""}&gt;</p>`);
	lines.push(`<p><strong>Phone:</strong> ${order.phone || (patient && patient.phoneNumber) || "N/A"}</p>`);
	lines.push(`<p><strong>Address:</strong> ${order.address || "N/A"}</p>`);
	lines.push(`<p><strong>Amount:</strong> ${order.amount || "N/A"}</p>`);
	lines.push(`<p><strong>Transaction ID:</strong> ${order.transactionId || "N/A"}</p>`);
	lines.push(`<h3>Products Requested</h3>`);
	lines.push(`<ul>`);
	for (const p of products) {
		lines.push(`<li>${p.pName || p.name || p._id} ${p.quantity ? `(qty: ${p.quantity})` : ""}</li>`);
	}
	lines.push(`</ul>`);

	const html = lines.join("\n");
	const text = html.replace(/<[^>]+>/g, ""); // fallback plain text

	try {
		const result = await sendMail({
			to: recipients,
			subject,
			text,
			html,
		});
		return result;
	} catch (err) {
		console.error("[mailsend] error sending hospital notification", err);
		return { ok: false, error: err };
	}
};

module.exports = { sendHospitalNotification };

