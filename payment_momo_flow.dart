import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import '../services/api_service.dart';

class PaymentMomoFlow extends StatefulWidget {
  @override
  _PaymentMomoFlowState createState() => _PaymentMomoFlowState();
}
class _PaymentMomoFlowState extends State<PaymentMomoFlow> {
  final ApiService api = ApiService();
  bool loading = false;
  String? payUrl;

  void startPayment() async {
    setState((){ loading = true; });
    final res = await api.initMomo(300000, 'Subscription 300k');
    setState((){ loading = false; });
    final momoResp = res['momoResp'] ?? res;
    final url = momoResp['payUrl'] ?? momoResp['redirectUrl'] ?? momoResp['payUrl'];
    if (url == null) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Không lấy được payUrl')));
      return;
    }
    final uri = Uri.parse(url);
    if (await canLaunchUrl(uri)) await launchUrl(uri, mode: LaunchMode.externalApplication);
    else ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Không thể mở đường link')));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Thanh toán Momo')),
      body: Center(
        child: loading ? CircularProgressIndicator() : ElevatedButton(onPressed: startPayment, child: Text('Thanh toán 300,000 VND')),
      ),
    );
  }
}
