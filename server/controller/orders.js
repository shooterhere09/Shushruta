const orderModel = require("../models/orders");
const productModel = require("../models/products");
const userModel = require("../models/users");
const { sendMail } = require("../config/mailer");
const { Blockchain, BlockchainManager } = require("../blockchain/blockchain");

const blockchainManager = new BlockchainManager();

class Order {
  async getAllOrders(req, res) {
    try {
      let Orders = await orderModel
        .find({})
        .populate("allProduct.id", "pName pImages")
        .populate("user", "name email")
        .sort({ _id: -1 });
      if (Orders) {
        return res.json({ Orders });
      }
    } catch (err) {
      console.log(err);
    }
  }

  async getOrderByUser(req, res) {
    let { uId } = req.body;
    if (!uId) {
      return res.json({ message: "All filled must be required" });
    } else {
      try {
        let Order = await orderModel
          .find({ user: uId })
          .populate("allProduct.id", "pName pImages")
          .populate("user", "name email")
          .sort({ _id: -1 });
        if (Order) {
          return res.json({ Order });
        }
      } catch (err) {
        console.log(err);
      }
    }
  }

  async postCreateOrder(req, res) {
    let { allProduct, user, amount, transactionId, address, phone } = req.body;
    if (
      !allProduct ||
      !user ||
      !amount ||
      !transactionId ||
      !address ||
      !phone
    ) {
      return res.json({ message: "All filled must be required" });
    } else {
      try {
        // Fetch product details to get hospital information
        const productIds = allProduct.map((p) => p.id);
        const products = await productModel.find({ _id: { $in: productIds } });

        // Get hospital information from the first product (primary hospital)
        let hname = null;
        let hemail = null;
        let hphone = null;

        if (products.length > 0) {
          const firstProduct = products[0];
          hname = firstProduct.hname || null;
          hemail = firstProduct.hemail || null;
          hphone = firstProduct.hphone || null;
        }

        let newOrder = new orderModel({
          allProduct,
          user,
          amount,
          transactionId,
          address,
          phone,
          hname,
          hemail,
          hphone,
        });
        let save = await newOrder.save();
        if (save) {
          // After saving the order, send emails to both hospital and patient
          try {
            // Fetch patient/user info
            const patient = await userModel.findById(user).select("name email phoneNumber");
            // console.log("[orders] 📧 EMAIL FLOW DEBUG - Order ID:", save._id);
            // console.log("[orders] Patient requesting:", patient ? patient.email : "Unknown");

            // Collect product details
            const productIds = allProduct.map((p) => p.id);
            const products = await productModel.find({ _id: { $in: productIds } });
            // console.log("[orders] Products in order:", products.length);

            const productDetails = [];
            for (const p of allProduct) {
              const prod = products.find((x) => String(x._id) === String(p.id));
              if (prod) {
                productDetails.push({
                  name: prod.pName,
                  quantity: p.quantity || p.quantitiy || 1,
                  description: prod.pDescription,
                  category: prod.pCategory,
                  medicalReport: prod.pMedicalReport,
                  timeWindowHours: prod.pTimeWindowHours,
                  expiryAt: prod.expiryAt,
                  status: prod.pStatus,
                });
              }
            }

            // Create blockchain data
            const blockData = {
              orderId: save._id,
              transactionId: transactionId,
              receiver: {
                id: patient._id,
                name: patient.name,
                email: patient.email,
                phone: patient.phoneNumber,
                address: address,
              },
              hospital: {
                name: hname,
                email: hemail,
                phone: hphone,
              },
              organ: productDetails,
              timestamp: new Date().toISOString(),
            };

            // Determine the organ category (assuming all products in an order belong to the same category for simplicity)
            const organCategory = productDetails.length > 0 ? productDetails[0].category : "unknown";

            // Add new block to the category-specific blockchain
            blockchainManager.addBlockToCategory(organCategory, blockData);
            console.log(`New block added to the ${organCategory} blockchain.`);
            console.log(`${organCategory} blockchain valid?`, blockchainManager.isCategoryChainValid(organCategory));

            // Retrieve the hash of the newly added block
            const latestBlock = blockchainManager.getChain(organCategory).getLatestBlock();
            const blockHash = latestBlock.hash;

            // Update the saved order with the blockHash
            await orderModel.findByIdAndUpdate(save._id, { blockHash: blockHash });
            console.log(`Order ${save._id} updated with blockHash: ${blockHash}`);

            // ===== SEND EMAIL TO HOSPITAL =====
            if (hname && hemail) {
              // console.log(`[orders] 📤 Sending hospital notification to: ${hemail}`);

              const hospitalData = {
                name: hname,
                email: hemail,
                phone: hphone,
                products: productDetails
              };

              const hospitalEmailBody = this.generateHospitalEmailBody(
                hospitalData,
                patient,
                save._id,
                address,
                phone,
                amount,
                transactionId
              );

              const result = await sendMail({
                to: hemail,
                subject: `New Organ Request Received - Order #${save._id}`,
                html: hospitalEmailBody,
              });

              if (result.ok) {
                // console.log("[orders] ✅ Hospital notification email sent successfully to:", hemail);
              } else {
                // console.log("[orders] ❌ Failed to send hospital email to:", hemail, result);
              }
            } else {
              // console.log("[orders] ⚠️  No hospital email found, skipping hospital notification");
            }

            // ===== SEND EMAIL TO PATIENT =====
            if (patient && patient.email) {
              // console.log(`[orders] 📤 Sending patient confirmation to: ${patient.email}`);

              const hospitalinfo = [{
                name: hname,
                email: hemail,
                phone: hphone
              }];

              const patientEmailBody = this.generatePatientEmailBody(
                patient,
                hospitalinfo,
                save._id,
                productDetails,
                amount,
                transactionId
              );

              const result = await sendMail({
                to: patient.email,
                subject: `Order Confirmation - Organ Request #${save._id}`,
                html: patientEmailBody,
              });

              if (result.ok) {
                // console.log("[orders] ✅ Patient confirmation email sent successfully to:", patient.email);
              } else {
                // console.log("[orders] ❌ Failed to send patient email to:", patient.email, result);
              }
            } else {
              // console.log("[orders] ⚠️  No patient email found, skipping patient notification");
            }

            // console.log("[orders] 📧 EMAIL FLOW COMPLETE");

          } catch (mailErr) {
            // console.error("[orders] ❌ Error sending order notification emails", mailErr);
            // Don't fail the order creation if email fails
          }

          return res.json({ success: "Order created successfully" });
        }
      } catch (err) {
        // console.error("[orders] Error creating order:", err);
        return res.json({ error: err.message || "Error creating order" });
      }
    }
  }

  // Generate HTML email for hospital
  generateHospitalEmailBody(hospitalData, patient, orderId, address, phone, amount, transactionId) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px; }
          .header { background-color: #2c3e50; color: white; padding: 20px; border-radius: 5px 5px 0 0; text-align: center; }
          .content { padding: 20px; }
          .section { margin: 20px 0; padding: 15px; background-color: #f9f9f9; border-left: 4px solid #3498db; }
          .section h3 { margin-top: 0; color: #2c3e50; }
          .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
          .detail-row:last-child { border-bottom: none; }
          .label { font-weight: bold; color: #555; }
          .value { color: #333; }
          .product-table { width: 100%; border-collapse: collapse; margin: 15px 0; }
          .product-table th { background-color: #3498db; color: white; padding: 10px; text-align: left; }
          .product-table td { padding: 10px; border-bottom: 1px solid #ddd; }
          .footer { background-color: #ecf0f1; padding: 15px; text-align: center; font-size: 12px; color: #7f8c8d; border-radius: 0 0 5px 5px; }
          .alert { background-color: #fff3cd; border: 1px solid #ffc107; padding: 15px; border-radius: 5px; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🏥 New Organ Request Received</h1>
          </div>

          <div class="content">
            <div class="alert">
              <strong>⚠️ Important:</strong> A patient has requested organs from your hospital. Please review the details below and respond promptly.
            </div>

            <div class="section">
              <h3>📋 Order Information</h3>
              <div class="detail-row">
                <span class="label">Order ID:</span>
                <span class="value">${orderId}</span>
              </div>
              <div class="detail-row">
                <span class="label">Transaction ID:</span>
                <span class="value">${transactionId}</span>
              </div>
              <div class="detail-row">
                <span class="label">Total Amount:</span>
                <span class="value">₹${amount}</span>
              </div>
            </div>

            <div class="section">
              <h3>👤 Patient Information</h3>
              <div class="detail-row">
                <span class="label">Name:</span>
                <span class="value">${patient.name}</span>
              </div>
              <div class="detail-row">
                <span class="label">Email:</span>
                <span class="value">${patient.email}</span>
              </div>
              <div class="detail-row">
                <span class="label">Phone:</span>
                <span class="value">${phone}</span>
              </div>
              <div class="detail-row">
                <span class="label">Address:</span>
                <span class="value">${address}</span>
              </div>
            </div>

            <div class="section">
              <h3>🏥 Requested Organs</h3>
              <table class="product-table">
                <thead>
                  <tr>
                    <th>Organ Name</th>
                    <th>Quantity</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  ${hospitalData.products.map(p => `
                    <tr>
                      <td>${p.name}</td>
                      <td>${p.quantity}</td>
                      <td></td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>

            <div class="section">
              <h3>📞 Hospital Contact Details</h3>
              <div class="detail-row">
                <span class="label">Hospital Name:</span>
                <span class="value">${hospitalData.name}</span>
              </div>
              <div class="detail-row">
                <span class="label">Email:</span>
                <span class="value">${hospitalData.email}</span>
              </div>
              <div class="detail-row">
                <span class="label">Phone:</span>
                <span class="value">${hospitalData.phone}</span>
              </div>
            </div>

            <p style="margin-top: 30px; color: #7f8c8d; font-size: 14px;">
              Please contact the patient at the provided phone number or email to confirm the organ availability and arrange the transfer.
            </p>
          </div>

          <div class="footer">
            <p>This is an automated email from Shushruta Organ Transplant Management System</p>
            <p>&copy; 2024 Shushruta. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Generate HTML email for patient
  generatePatientEmailBody(patient, hospitalinfo, orderId, products, amount, transactionId) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px; }
          .header { background-color: #27ae60; color: white; padding: 20px; border-radius: 5px 5px 0 0; text-align: center; }
          .content { padding: 20px; }
          .section { margin: 20px 0; padding: 15px; background-color: #f9f9f9; border-left: 4px solid #27ae60; }
          .section h3 { margin-top: 0; color: #2c3e50; }
          .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
          .detail-row:last-child { border-bottom: none; }
          .label { font-weight: bold; color: #555; }
          .value { color: #333; }
          .product-table { width: 100%; border-collapse: collapse; margin: 15px 0; }
          .product-table th { background-color: #27ae60; color: white; padding: 10px; text-align: left; }
          .product-table td { padding: 10px; border-bottom: 1px solid #ddd; }
          .hospital-card { background-color: #ecf0f1; padding: 15px; margin: 10px 0; border-radius: 5px; border-left: 4px solid #3498db; }
          .footer { background-color: #ecf0f1; padding: 15px; text-align: center; font-size: 12px; color: #7f8c8d; border-radius: 0 0 5px 5px; }
          .success-badge { background-color: #d4edda; border: 1px solid #c3e6cb; color: #155724; padding: 15px; border-radius: 5px; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Order Confirmation</h1>
          </div>

          <div class="content">
            <div class="success-badge">
              <strong>🎉 Success!</strong> Your organ request has been successfully placed and hospital have been notified.
            </div>

            <div class="section">
              <h3>📋 Order Details</h3>
              <div class="detail-row">
                <span class="label">Order ID:</span>
                <span class="value">${orderId}</span>
              </div>
              <div class="detail-row">
                <span class="label">Transaction ID:</span>
                <span class="value">${transactionId}</span>
              </div>
              <div class="detail-row">
                <span class="label">Total Amount:</span>
                <span class="value">₹${amount}</span>
              </div>
              <div class="detail-row">
                <span class="label">Order Date:</span>
                <span class="value">${new Date().toLocaleDateString('en-IN')}</span>
              </div>
            </div>

            <div class="section">
              <h3>🏥 Requested Organs</h3>
              <table class="product-table">
                <thead>
                  <tr>
                    <th>Organ Name</th>
                    <th>Quantity</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  ${products.map(p => `
                    <tr>
                      <td>${p.name}</td>
                      <td>${p.quantity}</td>
                      <td></td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>

            <div class="section">
              <h3>🏥 Hospital Information</h3>
              ${hospitalinfo.map(hospital => `
                <div class="hospital-card">
                  <div class="detail-row">
                    <span class="label">Hospital Name:</span>
                    <span class="value">${hospital.name}</span>
                  </div>
                  <div class="detail-row">
                    <span class="label">Email:</span>
                    <span class="value">${hospital.email}</span>
                  </div>
                  <div class="detail-row">
                    <span class="label">Phone:</span>
                    <span class="value">${hospital.phone}</span>
                  </div>
                </div>
              `).join('')}
            </div>

            <p style="margin-top: 30px; color: #7f8c8d; font-size: 14px;">
              The hospital have been notified about your request. They will contact you shortly to confirm organ availability and arrange the transfer. Please keep your phone and email accessible.
            </p>
          </div>

          <div class="footer">
            <p>This is an automated email from Shushruta Organ Transplant Management System</p>
            <p>&copy; 2024 Shushruta. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  async postUpdateOrder(req, res) {
    let { oId, status } = req.body;
    if (!oId || !status) {
      return res.json({ message: "All filled must be required" });
    } else {
      let currentOrder = orderModel.findByIdAndUpdate(oId, {
        status: status,
        updatedAt: Date.now(),
      });
      currentOrder.exec((err, result) => {
        if (err) console.log(err);
        return res.json({ success: "Order updated successfully" });
      });
    }
  }

  async postDeleteOrder(req, res) {
    let { oId } = req.body;
    if (!oId) {
      return res.json({ error: "All filled must be required" });
    } else {
      try {
        let deleteOrder = await orderModel.findByIdAndDelete(oId);
        if (deleteOrder) {
          return res.json({ success: "Order deleted successfully" });
        }
      } catch (error) {
        console.log(error);
      }
    }
  }
}

const ordersController = new Order();

// Bind all methods to the instance to preserve 'this' context
ordersController.getAllOrders = ordersController.getAllOrders.bind(ordersController);
ordersController.getOrderByUser = ordersController.getOrderByUser.bind(ordersController);
ordersController.postCreateOrder = ordersController.postCreateOrder.bind(ordersController);
ordersController.postUpdateOrder = ordersController.postUpdateOrder.bind(ordersController);
ordersController.postDeleteOrder = ordersController.postDeleteOrder.bind(ordersController);

module.exports = ordersController;
