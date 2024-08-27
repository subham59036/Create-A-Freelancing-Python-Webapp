import mysql.connector
from flask import Flask, render_template, abort, request, jsonify
from flask_cors import CORS
from datetime import datetime
import pytz

app = Flask(__name__, template_folder='template', static_folder='static')
CORS(app)
const_password = 'password'
my_tz = 'Asia/Kolkata'

con = mysql.connector.connect(
  host="mysqlserver",
  user="yourname",
  password="password",
  database="dbname"
)
cur = con.cursor()
cur.execute("CREATE TABLE IF NOT EXISTS orders (order_id TEXT, order_name TEXT, reciever_name TEXT, order_place TEXT, order_delivery TEXT, order_price TEXT, payment_status TEXT, payment_process TEXT, order_status TEXT, order_benefit TEXT)")
cur.execute("CREATE TABLE IF NOT EXISTS clients (reciever_name TEXT, reciever_email TEXT, reciever_mobile TEXT, reciever_address TEXT)")
cur.execute("CREATE TABLE IF NOT EXISTS confirms (order_id TEXT, reciever_name TEXT, confirm_process TEXT, confirm_data TEXT)")
con.commit()
cur.close()

@app.route('/r/freelance')
def profile_page():
    return render_template('freelance.html')

@app.route('/m/userdata')
def user_data_page():
    return render_template('userdata.html')

@app.route('/u/pay<order_id>')
def user_payment_page(order_id):
    c = con.cursor()
    c.execute("SELECT order_price FROM orders WHERE order_id = %s",(order_id,))
    order_price = c.fetchone()[0]
    c.execute("SELECT payment_process FROM orders WHERE order_id = %s",(order_id,))
    payment_process = c.fetchone()[0]
    c.execute("SELECT payment_status FROM orders WHERE order_id = %s",(order_id,))
    payment_status = c.fetchone()[0]
    c.close()
    return render_template('payment.html', order_id=order_id, payment_status=payment_status, payment_process=payment_process, order_price=order_price)

@app.post('/u/confirm')
def confirm_order_data():
    data = request.get_json()
    order_id = data.get('order-id')
    confirm_process = data.get('confirm-process')
    confirm_data = data.get('confirm-data')
    c = con.cursor()
    c.execute("SELECT reciever_name FROM orders WHERE order_id = %s",(order_id,))
    reciever_name = c.fetchone()[0]
    c.execute("SELECT order_id FROM confirms WHERE order_id = %s", (order_id,))
    orderid = c.fetchone()
    c.close()
    if orderid is not None:
        c = con.cursor()
        c.execute("UPDATE confirms SET confirm_process = %s WHERE order_id = %s", (confirm_process, order_id))
        con.commit()
        c.execute("UPDATE confirms SET confirm_data = %s WHERE order_id = %s", (confirm_data, order_id))
        con.commit()
        c.close()
        return jsonify({"status": "done"}), 200
    c = con.cursor()
    c.execute("INSERT INTO confirms (order_id, reciever_name, confirm_process, confirm_data) VALUES (%s, %s, %s, %s)", (order_id, reciever_name, confirm_process, confirm_data))
    con.commit()
    c.close()
    return jsonify({"status": "done"}), 200

@app.post('/m/neworder')
def new_order_data():
    data = request.get_json()
    password = data.get('password')
    if password != const_password:
        return "wrong password", 403
    loc_tz = pytz.timezone(my_tz)
    order_id = datetime.now(loc_tz).strftime('%S%M%H%Y%m%d')
    reciever_name = data.get('reciever-name')
    order_name = data.get('order-name')
    reciever_address = data.get('reciever-address')
    reciever_email = data.get('reciever-email')
    reciever_mobile = data.get('reciever-mobile')
    order_place = data.get('order-place')
    order_delivery = data.get('order-delivery')
    order_price = data.get('order-price')
    payment_status = data.get('payment-status')
    payment_process = data.get('payment-process')
    order_status = data.get('order-status')
    order_benefit = data.get('order-benefit')
    c = con.cursor()
    c.execute("INSERT INTO orders (order_id, order_name, reciever_name, order_place, order_delivery, order_price, payment_status, payment_process, order_status, order_benefit) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)", (order_id, order_name, reciever_name, order_place, order_delivery, order_price, payment_status, payment_process, order_status, order_benefit))
    con.commit()
    c.execute("INSERT INTO clients (reciever_name, reciever_email, reciever_mobile, reciever_address) VALUES (%s, %s, %s, %s)", (reciever_name, reciever_email, reciever_mobile, reciever_address))
    con.commit()
    c.close()
    return jsonify({"order_id": order_id}), 200

@app.post('/m/oldorder')
def old_order_data():
    data = request.get_json()
    password = data.get('password')
    if password != const_password:
        return "wrong password", 403
    order_id = data.get('order-id')
    c = con.cursor()
    c.execute("SELECT order_id FROM orders WHERE order_id = %s", (order_id,))
    orderid = c.fetchone()
    c.close()
    if orderid is None:
        return "no such order id", 400
    changed_parameter = data.get('changed-parameter')
    changed_data = data.get('changed-data')
    changed_param = f'{changed_parameter.split("-")[0]}' + '_' + f'{changed_parameter.split("-")[1]}'
    c = con.cursor()
    c.execute(f"UPDATE orders SET {changed_param} = %s WHERE order_id = %s", (changed_data, order_id))
    con.commit()
    c.close()
    if changed_parameter.startswith('reciever'):
        c = con.cursor()
        c.execute("SELECT reciever_name FROM orders WHERE order_id = %s",(order_id,))
        reciever_name = c.fetchone()[0]
        c.execute(f"UPDATE clients SET {changed_param} = %s WHERE reciever_name = %s", (changed_data, reciever_name))
        con.commit()
        c.close()
    return jsonify({"status": "done"}), 200

@app.post('/m/confirmpayment')
def confirm_payment_data():
    data = request.get_json()
    order_id = data.get('order-id')
    c = con.cursor()
    c.execute("UPDATE orders SET payment_status = %s WHERE order_id = %s", ('PAID', order_id))
    con.commit()
    c.execute("DELETE FROM confirms WHERE order_id = %s", (order_id,))
    con.commit()
    c.close()
    return jsonify({"status": "done"}), 200

@app.post('/m/declinepayment')
def decline_payment_data():
    data = request.get_json()
    order_id = data.get('order-id')
    c = con.cursor()
    c.execute("DELETE FROM confirms WHERE order_id = %s", (order_id,))
    con.commit()
    c.close()
    return jsonify({"status": "done"}), 200

@app.post('/m/deleteorder')
def delete_order_data():
    data = request.get_json()
    order_id = data.get('order-id')
    c = con.cursor()
    c.execute("DELETE FROM orders WHERE order_id = %s", (order_id,))
    con.commit()
    c.close()
    return jsonify({"status": "done"}), 200

@app.post('/m/deleteuser')
def delete_user_data():
    data = request.get_json()
    reciever_name = data.get('reciever-name')
    c = con.cursor()
    c.execute("DELETE FROM clients WHERE reciever_name = %s", (reciever_name,))
    con.commit()
    c.close()
    return jsonify({"status": "done"}), 200


@app.post('/m/getuser')
def get_user_data():
    data = request.get_json()
    password = data.get('password')
    if password != const_password:
        return "wrong password", 403
    c = con.cursor()
    c.execute("SELECT reciever_name FROM clients")
    reciever_names = c.fetchall()
    c.close()
    if not reciever_names:
        return "no recievers", 400
    reciever_list = []
    unique_recievers= []
    for reciever_name_tuple in reciever_names:
        reciever_name = reciever_name_tuple[0]
        if reciever_name in unique_recievers:
            continue
        unique_recievers.append(reciever_name)
        c = con.cursor()
        c.execute(" SELECT reciever_mobile FROM clients WHERE reciever_name = %s",(reciever_name,))
        reciever_mobile = c.fetchone()[0]
        c.execute("SELECT reciever_email FROM clients WHERE reciever_name = %s",(reciever_name,))
        reciever_email = c.fetchone()[0]
        c.execute("SELECT reciever_address FROM clients WHERE reciever_name = %s",(reciever_name,))
        reciever_address = c.fetchone()[0]
        c.close()
        reciever_dict = {
            'reciever_name': reciever_name,
            'reciever_mobile': reciever_mobile,
            'reciever_email': reciever_email,
            'reciever_address': reciever_address
        }
        reciever_list.append(reciever_dict)
    return jsonify(reciever_list), 200

@app.post('/m/getconfirm')
def get_confirm_data():
    data = request.get_json()
    password = data.get('password')
    if password != const_password:
        return "wrong password", 403
    c = con.cursor()
    c.execute("SELECT order_id FROM confirms")
    order_ids = c.fetchall()
    c.close()
    if not order_ids:
        return "no confirms", 400
    confirm_list = []
    unique_orders= []
    for order_id_tuple in order_ids:
        order_id = order_id_tuple[0]
        if order_id in unique_orders:
            continue
        unique_orders.append(order_id)
        c = con.cursor()
        c.execute(" SELECT reciever_name FROM confirms WHERE order_id = %s",(order_id,))
        reciever_name = c.fetchone()[0]
        c.execute("SELECT confirm_process FROM confirms WHERE order_id = %s",(order_id,))
        confirm_process = c.fetchone()[0]
        c.execute("SELECT confirm_data FROM confirms WHERE order_id = %s",(order_id,))
        confirm_data = c.fetchone()[0]
        c.close()
        confirm_dict = {
            'order_id': order_id,
            'reciever_name': reciever_name,
            'confirm_process': confirm_process,
            'confirm_data': confirm_data
        }
        confirm_list.append(confirm_dict)
    return jsonify(confirm_list), 200

@app.post('/m/getorder')
def get_order_data():
    data = request.get_json()
    password = data.get('password')
    if password != const_password:
        return "wrong password", 403
    c = con.cursor()
    c.execute("SELECT order_id FROM orders")
    order_ids = c.fetchall()
    c.close()
    if not order_ids:
        return "no orders", 400
    order_list = []
    unique_orders= []
    for order_id_tuple in order_ids:
        order_id = order_id_tuple[0]
        if order_id in unique_orders:
            continue
        unique_orders.append(order_id)
        c = con.cursor()
        c.execute("SELECT order_name FROM orders WHERE order_id = %s",(order_id,))
        order_name = c.fetchone()[0]
        c.execute("SELECT order_price FROM orders WHERE order_id = %s",(order_id,))
        order_price = c.fetchone()[0]
        c.execute("SELECT order_place FROM orders WHERE order_id = %s",(order_id,))
        order_place = c.fetchone()[0]
        c.execute("SELECT order_delivery FROM orders WHERE order_id = %s",(order_id,))
        order_delivery = c.fetchone()[0]
        c.execute("SELECT order_status FROM orders WHERE order_id = %s",(order_id,))
        order_status = c.fetchone()[0]
        c.execute("SELECT order_benefit FROM orders WHERE order_id = %s",(order_id,))
        order_benefit = c.fetchone()[0]
        benefits = order_benefit.split('*')
        c.execute("SELECT reciever_name FROM orders WHERE order_id = %s",(order_id,))
        reciever_name = c.fetchone()[0]
        c.execute("SELECT payment_process FROM orders WHERE order_id = %s",(order_id,))
        payment_process = c.fetchone()[0]
        c.execute("SELECT payment_status FROM orders WHERE order_id = %s",(order_id,))
        payment_status = c.fetchone()[0]
        c.close()
        order_dict = {
            'order_id': order_id,
            'reciever_name': reciever_name,
            'order_name': order_name,
            'order_place': order_place,
            'order_delivery': order_delivery,
            'order_status': order_status,
            'order_benefit': benefits,
            'order_price': order_price,
            'payment_process': payment_process,
            'payment_status': payment_status
        }
        order_list.append(order_dict)
    return jsonify(order_list), 200

@app.route("/u/order<order_id>")
def order_page(order_id):
    c = con.cursor()
    c.execute("SELECT order_id FROM orders WHERE order_id = %s", (order_id,))
    orderid = c.fetchone()
    c.close()
    if orderid is None:
        return abort(403)
    c = con.cursor()
    c.execute(" SELECT order_name FROM orders WHERE order_id = %s",(order_id,))
    order_name = c.fetchone()[0]
    c.execute("SELECT order_price FROM orders WHERE order_id = %s",(order_id,))
    order_price = c.fetchone()[0]
    c.execute("SELECT order_place FROM orders WHERE order_id = %s",(order_id,))
    order_place = c.fetchone()[0]
    c.execute("SELECT order_delivery FROM orders WHERE order_id = %s",(order_id,))
    order_delivery = c.fetchone()[0]
    c.execute("SELECT order_status FROM orders WHERE order_id = %s",(order_id,))
    order_status = c.fetchone()[0]
    c.execute("SELECT order_benefit FROM orders WHERE order_id = %s",(order_id,))
    order_benefit = c.fetchone()[0]
    benefits = order_benefit.split('*')
    c.execute("SELECT reciever_name FROM orders WHERE order_id = %s",(order_id,))
    reciever_name = c.fetchone()[0]
    c.execute("SELECT payment_process FROM orders WHERE order_id = %s",(order_id,))
    payment_process = c.fetchone()[0]
    c.execute("SELECT payment_status FROM orders WHERE order_id = %s",(order_id,))
    payment_status = c.fetchone()[0]
    c.execute("SELECT reciever_email FROM clients WHERE reciever_name = %s",(reciever_name,))
    reciever_email = c.fetchone()[0]
    c.execute("SELECT reciever_address FROM clients WHERE reciever_name = %s",(reciever_name,))
    reciever_address = c.fetchone()[0]
    c.execute("SELECT reciever_mobile FROM clients WHERE reciever_name = %s",(reciever_name,))
    reciever_mobile = c.fetchone()[0]
    c.close()
    loc_tz = pytz.timezone(my_tz)
    bill_id = datetime.now(loc_tz).strftime('%Y%m%d%H%M%S')
    bill_date = datetime.now(loc_tz).strftime('%d.%m.%Y')
    return render_template('order.html', order_id=order_id, order_name=order_name, reciever_name=reciever_name, reciever_address=reciever_address, reciever_email=reciever_email, reciever_mobile=reciever_mobile, order_place=order_place, order_delivery=order_delivery, order_price=order_price, payment_status=payment_status, payment_process=payment_process, order_status=order_status, benefits=benefits, bill_id=bill_id, bill_date=bill_date)

if __name__ == '__main__':
    app.run()
