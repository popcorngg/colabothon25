// hooks/useAINavigation.js
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

export const useAINavigation = (currentPage = 'dashboard') => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [response, setResponse] = useState('');

    const sendAICommand = async (input, additionalContext = {}) => {
        if (!input.trim()) return;

        setLoading(true);
        setResponse('🤖 Processing your request...');

        try {
            const res = await fetch('http://localhost:5000/api/neural-action', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    input,
                    current_page: currentPage,
                    ...additionalContext,
                }),
            });

            const data = await res.json();
            const result = data.result || 'No response from AI';

            setResponse(result);

            // Автоматическая навигация если есть команда
            if (data.action && data.action.type === 'navigate') {
                // Озвучиваем сообщение
                if ('speechSynthesis' in window) {
                    const utterance = new SpeechSynthesisUtterance(result);
                    utterance.lang = detectLanguage(result);
                    window.speechSynthesis.speak(utterance);
                }

                // Переходим на новую страницу через 1.5 секунды
                setTimeout(() => {
                    navigate(data.action.route);
                }, 1500);
            }

            return { result, action: data.action };
        } catch (error) {
            console.error('AI Navigation Error:', error);
            const errorMsg = 'Error connecting to AI';
            setResponse(errorMsg);
            return { result: errorMsg, error: true };
        } finally {
            setLoading(false);
        }
    };

    const detectLanguage = (text) => {
        if (text.match(/[а-яА-ЯЁё]/)) return 'ru-RU';
        if (text.match(/[ąćęłńóśźżĄĆĘŁŃÓŚŹŻ]/)) return 'pl-PL';
        return 'en-US';
    };

    return {
        sendAICommand,
        loading,
        response,
        setResponse,
    };
};

export default useAINavigation; 