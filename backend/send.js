document.getElementById('documentForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];

    if (!file) {
        alert('Выберите файл');
        return;
    }

    // Создаем FormData
    const formData = new FormData();
    formData.append('file', file);

    // Показываем индикатор загрузки
    document.getElementById('result').innerHTML = '⏳ Анализирую документ...';

    try {
        // Отправляем файл на сервер
        const response = await fetch('http://localhost:5000/api/document/analyze', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (data.success) {
            // Показываем результат
            document.getElementById('result').innerHTML = `
        <h3>📄 ${data.analysis.filename}</h3>
        <div style="white-space: pre-wrap;">${data.analysis.summary}</div>
      `;
        } else {
            document.getElementById('result').innerHTML = `❌ Ошибка: ${data.error}`;
        }
    } catch (error) {
        document.getElementById('result').innerHTML = `❌ Ошибка: ${error.message}`;
    }
});