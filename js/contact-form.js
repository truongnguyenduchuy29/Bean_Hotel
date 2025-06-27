// Contact Form Handler
document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contact');
    const submitBtn = document.querySelector('.btn-lienhe');
    
    if (contactForm && submitBtn) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Validate form
            if (validateForm()) {
                // Show loading state
                showLoading();
                
                // Simulate form submission (replace with actual submission logic)
                setTimeout(() => {
                    hideLoading();
                    showSuccessNotification();
                    resetForm();
                }, 2000);
            }
        });
    }
    
    function validateForm() {
        const name = document.querySelector('input[name="contact[Name]"]');
        const email = document.querySelector('input[name="contact[email]"]');
        const message = document.querySelector('textarea[name="contact[body]"]');
        
        let isValid = true;
        
        // Remove previous error states
        clearErrors();
        
        // Validate name
        if (!name.value.trim()) {
            showError(name, 'Vui lòng nhập họ và tên');
            isValid = false;
        }
        
        // Validate email
        if (!email.value.trim()) {
            showError(email, 'Vui lòng nhập email');
            isValid = false;
        } else if (!isValidEmail(email.value)) {
            showError(email, 'Email không hợp lệ');
            isValid = false;
        }
        
        // Validate message
        if (!message.value.trim()) {
            showError(message, 'Vui lòng nhập nội dung tin nhắn');
            isValid = false;
        }
        
        return isValid;
    }
    
    function showError(input, message) {
        input.classList.add('error');
        
        // Create or update error message
        let errorMsg = input.parentNode.querySelector('.error-message');
        if (!errorMsg) {
            errorMsg = document.createElement('div');
            errorMsg.className = 'error-message';
            input.parentNode.appendChild(errorMsg);
        }
        
        errorMsg.textContent = message;
        errorMsg.style.display = 'block';
        errorMsg.style.color = '#dc3545';
        errorMsg.style.fontSize = '12px';
        errorMsg.style.marginTop = '5px';
        
        // Remove error on input
        input.addEventListener('input', function() {
            input.classList.remove('error');
            errorMsg.style.display = 'none';
        });
    }
    
    function clearErrors() {
        document.querySelectorAll('.form-control').forEach(input => {
            input.classList.remove('error');
        });
        document.querySelectorAll('.error-message').forEach(msg => {
            msg.style.display = 'none';
        });
    }
    
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    function showLoading() {
        submitBtn.classList.add('loading');
        submitBtn.innerHTML = '<span>GỬI LIÊN HỆ</span>';
    }
    
    function hideLoading() {
        submitBtn.classList.remove('loading');
        submitBtn.innerHTML = 'GỬI LIÊN HỆ';
    }
    
    function showSuccessNotification() {
        // Remove existing notifications
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(notification => notification.remove());
        
        // Create notification
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.innerHTML = `
            <div class="icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </div>
            <div class="content">
                <h4>Gửi thành công!</h4>
                <p>Cảm ơn bạn đã liên hệ. Chúng tôi sẽ phản hồi sớm nhất.</p>
            </div>
            <button class="close" onclick="this.parentElement.remove()">×</button>
        `;
        
        document.body.appendChild(notification);
        
        // Show notification
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.classList.remove('show');
                setTimeout(() => {
                    notification.remove();
                }, 500);
            }
        }, 5000);
    }
    
    function resetForm() {
        contactForm.reset();
        clearErrors();
    }
    
    // Đã loại bỏ tất cả hiệu ứng focus animation
});
