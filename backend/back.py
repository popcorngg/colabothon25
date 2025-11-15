from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime
import os
import requests
from dotenv import load_dotenv
import time

# Загружаем переменные окружения из .env файла
load_dotenv()

app = Flask(__name__)
CORS(app)

# OpenRouter API configuration
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
if not OPENROUTER_API_KEY:
    print("[WARNING] OPENROUTER_API_KEY не задан. Добавьте его в .env для работы API.")
    OPENROUTER_API_KEY = None

OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions"

# Данные пользователя (в реальном приложении это должно браться из БД)
USER_DATA = {
    "balance": 1520.30,
    "currency": "zł",
    "card_number": "**** **** **** 1234",
    "transactions": [
        {"id": 1, "type": "income", "name": "Salary Payment", "amount": 200, "date": "12 Nov 2025", "category": "salary"},
        {"id": 2, "type": "expense", "name": "Grocery Shopping", "amount": -50, "date": "11 Nov 2025", "category": "groceries"},
        {"id": 3, "type": "expense", "name": "Pharmacy", "amount": -15, "date": "10 Nov 2025", "category": "health"},
        {"id": 4, "type": "expense", "name": "Coffee Shop", "amount": -10, "date": "10 Nov 2025", "category": "food"},
        {"id": 5, "type": "income", "name": "Gift Received", "amount": 100, "date": "09 Nov 2025", "category": "gift"}
    ]
}

# Получаем список доступных моделей при запуске
def get_available_model():
    """Получает модель из OpenRouter с fallback механизмом"""
    # Список моделей в порядке приоритета (от лучших к резервным)
    models = [
        "openai/gpt-4o-mini",  # Самая стабильная, платная но дешевая
        "google/gemini-flash-1.5",  # Бесплатная, быстрая
        "mistralai/mistral-7b-instruct:free",
        "microsoft/phi-3-mini-128k-instruct:free",
        "qwen/qwen-2-7b-instruct:free"
    ]
    
    model = models[0]  # По умолчанию первая
    print(f"[INFO] Используем модель: {model} (OpenRouter)")
    return model

def get_financial_context():
    """Формирует контекст с информацией о финансах пользователя"""
    total_income = sum(t['amount'] for t in USER_DATA['transactions'] if t['amount'] > 0)
    total_expenses = sum(abs(t['amount']) for t in USER_DATA['transactions'] if t['amount'] < 0)
    
    context = f"""
=== USER'S FINANCIAL DATA ===
Current Balance: {USER_DATA['balance']} {USER_DATA['currency']}
Card Number: {USER_DATA['card_number']}
Total Income: {total_income} {USER_DATA['currency']}
Total Expenses: {total_expenses} {USER_DATA['currency']}
Net Result: {total_income - total_expenses} {USER_DATA['currency']}

=== RECENT TRANSACTIONS ===
"""
    
    for t in USER_DATA['transactions']:
        symbol = "+" if t['amount'] > 0 else "-"
        context += f"- [{t['date']}] {t['name']}: {symbol}{abs(t['amount'])} {USER_DATA['currency']} (category: {t['category']})\n"
    
    return context

def get_app_structure():
    """Формирует контекст со структурой приложения и его функциями"""
    structure = """
=== BANKING APP STRUCTURE & FEATURES ===

📱 MAIN SECTIONS (Tabs/Pages):

1. HOME / DASHBOARD
   - Shows current balance and card number
   - Displays quick financial summary
   - Recent transactions preview (last 5)
   - Quick actions buttons

2. TRANSACTIONS / HISTORY
   - Full list of all transactions
   - Each transaction shows:
     * Transaction name
     * Amount (+ for income, - for expenses)
     * Date
     * Category (salary, groceries, health, food, gift, etc.)
   - Filterable by type (income/expense)
   - Sortable by date

3. ANALYTICS / STATISTICS
   - Visual charts and graphs
   - Spending by category breakdown
   - Income vs Expenses comparison
   - Monthly trends
   - Budget insights

4. AI ASSISTANT (Current Chat)
   - Natural language financial advisor
   - Can answer questions about user's finances
   - Provides budget recommendations
   - Helps with financial planning
   - Access to all user's financial data

5. SETTINGS / PROFILE
   - Account settings
   - Notification preferences
   - Security settings
   - Language selection

🔧 AVAILABLE ACTIONS:
- View balance
- Review transactions
- Analyze spending patterns
- Get financial advice
- Plan budget
- Track expenses by category
- Compare income vs expenses

💡 WHAT YOU CAN HELP WITH:
- "Show me my balance" → provide current balance
- "What did I spend on groceries?" → analyze grocery transactions
- "How much did I earn this month?" → calculate total income
- "Where do I see my transactions?" → explain Transactions tab
- "How to check analytics?" → explain Analytics section
- "Give me budget advice" → analyze data and provide recommendations
- "What's my biggest expense?" → identify largest spending category
"""
    return structure

AVAILABLE_MODEL = get_available_model()

def call_openrouter(prompt, retry_count=0, max_retries=2, current_page=None):
    """Отправляет запрос к OpenRouter API с контекстом финансовых данных и структуры приложения"""
    print(f"[DEBUG] Получен запрос: {prompt}")
    print(f"[DEBUG] Текущая страница: {current_page}")
    print(f"[DEBUG] Используем модель: {AVAILABLE_MODEL} (попытка {retry_count + 1})")
    
    try:
        # Формируем контекст с информацией пользователя
        financial_context = get_financial_context()
        app_structure = get_app_structure()
        
        # Добавляем информацию о текущей странице, если она передана
        current_page_info = ""
        if current_page:
            current_page_info = f"\n🎯 USER IS CURRENTLY ON: {current_page.upper()} PAGE\n"
        
        # УЛУЧШЕННЫЙ системный промпт с информацией о структуре приложения
        system_prompt = f"""You are "FinBot" - an intelligent AI assistant integrated into a banking mobile application. 

{app_structure}

{current_page_info}

{financial_context}

🎯 YOUR CAPABILITIES:
1. **Navigation Help**: Guide users through the app's sections and features
2. **Financial Analysis**: Analyze user's transactions, income, and expenses
3. **Budget Advice**: Provide personalized financial recommendations
4. **Feature Explanation**: Explain what each section of the app does
5. **Data Insights**: Answer specific questions about user's financial data
6. **General Assistance**: Help with any banking or financial questions

📋 RESPONSE GUIDELINES:
1. **Language Matching**: ALWAYS respond in the SAME LANGUAGE as the user's question
2. **Context Awareness**: If user asks "where can I see X?", tell them which tab/section to use
3. **Be Specific**: Reference actual numbers from user's data when relevant
4. **Be Helpful**: If user seems lost, proactively suggest relevant features
5. **Navigation**: When directing users, use clear section names (Home, Transactions, Analytics, Settings)
6. **Current Location**: Consider which page user is on and provide contextual help
7. **Concise**: 2-4 sentences for simple questions, detailed explanations when needed

💬 EXAMPLE INTERACTIONS:
- "Where can I see all my transactions?" → "Go to the Transactions tab to see your complete transaction history..."
- "What's my balance?" → "Your current balance is [amount] zł..."
- "How much did I spend on food?" → "Looking at your transactions, you spent [X] zł on food..."
- "What does Analytics show?" → "The Analytics section provides visual charts showing your spending by category..."

Current date: {datetime.now().strftime("%d %B %Y")}

Remember: You have full access to the user's financial data and complete knowledge of the app's structure. Use this to provide accurate, helpful, and contextual assistance!"""
        
        # Если API ключ не установлен, используем mock ответ
        if not OPENROUTER_API_KEY:
            print("[DEBUG] API Key не установлен - используем MOCK режим")
            mock_response = f"[MOCK] Привет! Я FinBot - твой финансовый помощник. Твой баланс: {USER_DATA['balance']} zł. Если у вас есть настоящий OpenRouter ключ, добавьте его в backend/.env для полноценной работы AI."
            return mock_response
        
        # Отправляем запрос к OpenRouter API
        headers = {
            "Authorization": f"Bearer {OPENROUTER_API_KEY}",
            "Content-Type": "application/json",
            "HTTP-Referer": "http://localhost:3000",
            "X-Title": "Financial AI Assistant"
        }
        
        payload = {
            "model": AVAILABLE_MODEL,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt},
            ],
            "temperature": 0.7,  # Баланс между креативностью и точностью
            "max_tokens": 800,  # Увеличили лимит для более полных ответов
            "top_p": 0.9,
        }
        
        print(f"[DEBUG] Sending request to OpenRouter...")
        response = requests.post(OPENROUTER_API_URL, headers=headers, json=payload, timeout=30)
        
        print(f"[DEBUG] OpenRouter Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            answer = data.get("choices", [{}])[0].get("message", {}).get("content", "")
            
            if not answer:
                return "Извините, не удалось получить ответ. Попробуйте переформулировать вопрос."
            
            print(f"[DEBUG] Ответ от OpenRouter получен ({len(answer)} символов)")
            return answer.strip()
            
        elif response.status_code == 429:
            # Rate limit - пробуем повторить с задержкой
            print(f"[DEBUG] Rate limit (429) - попытка {retry_count + 1}/{max_retries}")
            if retry_count < max_retries:
                wait_time = 2 ** retry_count  # Экспоненциальная задержка: 1s, 2s, 4s
                print(f"[DEBUG] Ожидание {wait_time} секунд...")
                time.sleep(wait_time)
                return call_openrouter(prompt, retry_count + 1, max_retries, current_page)
            else:
                return "⚠️ Сервис временно перегружен. Пожалуйста, попробуйте через минуту или используйте платную модель для стабильной работы."
                
        elif response.status_code == 401:
            print(f"[DEBUG] OpenRouter 401 - Invalid API Key")
            return "❌ Ошибка авторизации. Проверьте API ключ на https://openrouter.ai/keys"
            
        elif response.status_code == 400:
            error_data = response.json()
            error_msg = error_data.get("error", {}).get("message", "Unknown error")
            print(f"[DEBUG] OpenRouter 400 - Bad Request: {error_msg}")
            return f"❌ Ошибка запроса: {error_msg}"
            
        else:
            error_msg = response.text[:300]
            print(f"[DEBUG] OpenRouter Error ({response.status_code}): {error_msg}")
            return f"⚠️ Ошибка API ({response.status_code}). Попробуйте позже."
        
    except requests.exceptions.Timeout:
        print(f"[DEBUG] Timeout при обращении к OpenRouter")
        return "⚠️ Превышено время ожидания ответа. Попробуйте еще раз."
        
    except requests.exceptions.ConnectionError:
        print(f"[DEBUG] Connection error")
        return "⚠️ Ошибка подключения к серверу. Проверьте интернет-соединение."
        
    except Exception as e:
        print(f"[DEBUG] Непредвиденная ошибка: {str(e)}")
        return f"⚠️ Произошла ошибка: {str(e)[:100]}"


@app.route("/api/neural-action", methods=["POST"])
def neural_action():
    """Обрабатывает запросы к AI ассистенту"""
    body = request.json
    user_input = body.get("input", "").strip()
    current_page = body.get("current_page", None)  # Опциональная информация о текущей странице

    if not user_input:
        return jsonify({"error": "Введите сообщение"}), 400

    # Получаем ответ от нейросети с учетом текущей страницы
    result = call_openrouter(user_input, current_page=current_page)
    
    return jsonify({
        "result": result,
        "timestamp": datetime.now().isoformat(),
        "model": AVAILABLE_MODEL,
        "current_page": current_page
    })


@app.route("/api/health", methods=["GET"])
def health():
    """Проверка работоспособности сервера"""
    return jsonify({
        "status": "ok",
        "timestamp": datetime.now().isoformat(),
        "model": AVAILABLE_MODEL,
        "api_key_configured": bool(OPENROUTER_API_KEY)
    })

@app.route("/api/user/data", methods=["GET"])
def get_user_data():
    """Возвращает данные пользователя"""
    return jsonify(USER_DATA)

@app.route("/api/user/financial-context", methods=["GET"])
def get_user_context():
    """Возвращает финансовый контекст в текстовом формате"""
    context = get_financial_context()
    return jsonify({"context": context})

@app.route("/api/app/structure", methods=["GET"])
def get_app_info():
    """Возвращает информацию о структуре приложения"""
    structure = get_app_structure()
    return jsonify({"structure": structure})


if __name__ == "__main__":
    print("=" * 50)
    print("🚀 Financial AI Assistant Backend")
    print("=" * 50)
    print(f"✓ Сервер: http://localhost:5000")
    print(f"✓ Модель: {AVAILABLE_MODEL}")
    print(f"✓ API ключ: {'✓ Настроен' if OPENROUTER_API_KEY else '✗ Не настроен (MOCK режим)'}")
    print("=" * 50)
    app.run(host="0.0.0.0", port=5000, debug=True)