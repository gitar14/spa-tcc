import 'package:flutter_test/flutter_test.dart';
import 'package:spa_mobile/main.dart';

void main() {
  testWidgets('renders mobile dashboard title', (tester) async {
    await tester.pumpWidget(const SpaMobileApp());

    expect(find.text('Dashboard Mobile'), findsOneWidget);
  });
}
