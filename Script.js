document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const chatMessages = document.getElementById('chat-messages');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');
    const clearChatButton = document.getElementById('clear-chat');
    const typingIndicator = document.getElementById('typing-indicator');
    
    // Configuration with integrated API key
    const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzawejrfkejrjtE5C4MIsdkjfdsuhM745wpYlfjdfm151-gKvsUQ";
    
    // Chat history
    let chatHistory = [];
    
    // Initialize the chat
    function initChat() {
        loadChatHistory();
        setupEventListeners();
        adjustTextareaHeight();
    }
    
    // Set up event listeners
    function setupEventListeners() {
        sendButton.addEventListener('click', sendMessage);
        
        userInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
        
        userInput.addEventListener('input', adjustTextareaHeight);
        clearChatButton.addEventListener('click', clearChatHistory);
    }
    
    // Adjust textarea height based on content
    function adjustTextareaHeight() {
        userInput.style.height = 'auto';
        userInput.style.height = Math.min(userInput.scrollHeight, 150) + 'px';
    }
    
    // Send user message to Gemini API
    async function sendMessage() {
        const message = userInput.value.trim();
        if (!message) return;
        
        addMessageToChat('user', message);
        userInput.value = '';
        adjustTextareaHeight();
        showTypingIndicator(true);
        
        try {
            const requestData = {
                contents: [
                    ...chatHistory,
                    {
                        role: 'user',
                        parts: [{ text: message }]
                    }
                ]
            };
            
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestData)
            });
            
            if (!response.ok) {
                throw new Error(`API request failed with status ${response.status}`);
            }
            
            const data = await response.json();
            const aiResponse = data.candidates[0].content.parts[0].text;
            
            addMessageToChat('bot', aiResponse);
            
            chatHistory.push(
                {
                    role: 'user',
                    parts: [{ text: message }]
                },
                {
                    role: 'model',
                    parts: [{ text: aiResponse }]
                }
            );
            
            saveChatHistory();
            
        } catch (error) {
            console.error('Error calling Gemini API:', error);
            addMessageToChat('bot', 'කණගාටුයි, මට දෝෂයක් ඇතිවිය. කරුණාකර පසුව උත්සාහ කරන්න.');
        } finally {
            showTypingIndicator(false);
        }
    }
    
    // Add a message to the chat UI
    function addMessageToChat(sender, message) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', `${sender}-message`);
        
        const formattedMessage = message.replace(/\n/g, '<br>');
        messageElement.innerHTML = formattedMessage;
        
        const timestamp = document.createElement('div');
        timestamp.classList.add('message-time');
        timestamp.textContent = getCurrentTime();
        messageElement.appendChild(timestamp);
        
        chatMessages.appendChild(messageElement);
        scrollToBottom();
    }
    
    // Show/hide typing indicator
    function showTypingIndicator(show) {
        if (show) {
            typingIndicator.classList.add('active');
        } else {
            typingIndicator.classList.remove('active');
        }
        scrollToBottom();
    }
    
    // Get current time in HH:MM format
    function getCurrentTime() {
        const now = new Date();
        return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // Scroll chat to the bottom
    function scrollToBottom() {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    // Save chat history to local storage
    function saveChatHistory() {
        localStorage.setItem('geminiChatHistory', JSON.stringify(chatHistory));
    }
    
    // Load chat history from local storage
    function loadChatHistory() {
        const savedHistory = localStorage.getItem('geminiChatHistory');
        if (savedHistory) {
            chatHistory = JSON.parse(savedHistory);
            
            chatHistory.forEach((item, index) => {
                if (item.role === 'user' || item.role === 'model') {
                    const sender = item.role === 'user' ? 'user' : 'bot';
                    addMessageToChat(sender, item.parts[0].text);
                }
            });
            
            scrollToBottom();
        }
    }
    
    // Clear chat history
    function clearChatHistory() {
        if (confirm('ඔබට චැට් ඉතිහාසය මැකීමට අවශ්‍යද?')) {
            chatHistory = [];
            chatMessages.innerHTML = `
                <div class="welcome-message">
                    <p>ආයුබෝවන්! මම ඔබේ Gemini AI සහායකය. අද මට ඔබට කෙසේ සහය විය හැකිද?</p>
                </div>
            `;
            localStorage.removeItem('geminiChatHistory');
        }
    }
    
    // Initialize the chat
    initChat();
});