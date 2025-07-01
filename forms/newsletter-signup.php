<?php
/**
 * Newsletter Signup Handler
 * Little Color Wonders
 */

// Enable CORS if needed
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// Get POST data
$input = json_decode(file_get_contents('php://input'), true);
$name = isset($input['name']) ? trim($input['name']) : '';
$email = isset($input['email']) ? trim($input['email']) : '';

// Basic validation
if (empty($name) || empty($email)) {
    http_response_code(400);
    echo json_encode(['error' => 'Name and email are required']);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid email address']);
    exit;
}

// Configuration - UPDATE THESE VALUES
$config = [
    'email_service' => 'mailchimp', // Options: 'mailchimp', 'convertkit', 'database', 'email'
    
    // Mailchimp settings
    'mailchimp_api_key' => 'YOUR_MAILCHIMP_API_KEY',
    'mailchimp_list_id' => 'YOUR_MAILCHIMP_LIST_ID',
    
    // ConvertKit settings  
    'convertkit_api_key' => 'YOUR_CONVERTKIT_API_KEY',
    'convertkit_form_id' => 'YOUR_CONVERTKIT_FORM_ID',
    
    // Email notification settings
    'notification_email' => 'hello@littlecolorwonders.com',
    'from_email' => 'hello@littlecolorwonders.com',
    'from_name' => 'Little Color Wonders',
    
    // Database settings (if using database storage)
    'db_host' => 'localhost',
    'db_name' => 'your_database',
    'db_user' => 'your_username', 
    'db_pass' => 'your_password'
];

// Choose signup method based on configuration
switch ($config['email_service']) {
    case 'mailchimp':
        $result = signupMailchimp($name, $email, $config);
        break;
        
    case 'convertkit':
        $result = signupConvertKit($name, $email, $config);
        break;
        
    case 'database':
        $result = signupDatabase($name, $email, $config);
        break;
        
    case 'email':
    default:
        $result = signupEmail($name, $email, $config);
        break;
}

// Send response
if ($result['success']) {
    echo json_encode([
        'success' => true,
        'message' => 'Thank you for signing up! Check your email for your free download.'
    ]);
} else {
    http_response_code(500);
    echo json_encode([
        'error' => $result['message']
    ]);
}

/**
 * Mailchimp signup
 */
function signupMailchimp($name, $email, $config) {
    $api_key = $config['mailchimp_api_key'];
    $list_id = $config['mailchimp_list_id'];
    
    if (empty($api_key) || empty($list_id)) {
        return ['success' => false, 'message' => 'Mailchimp not configured'];
    }
    
    $datacenter = substr($api_key, strpos($api_key, '-') + 1);
    $url = "https://{$datacenter}.api.mailchimp.com/3.0/lists/{$list_id}/members";
    
    $data = [
        'email_address' => $email,
        'status' => 'subscribed',
        'merge_fields' => [
            'FNAME' => $name
        ]
    ];
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Authorization: apikey ' . $api_key,
        'Content-Type: application/json'
    ]);
    curl_setopt($ch, CURLOPT_USERAGENT, 'Little Color Wonders');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    
    $response = curl_exec($ch);
    $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    return ['success' => $http_code === 200, 'message' => $response];
}

/**
 * ConvertKit signup
 */
function signupConvertKit($name, $email, $config) {
    $api_key = $config['convertkit_api_key'];
    $form_id = $config['convertkit_form_id'];
    
    if (empty($api_key) || empty($form_id)) {
        return ['success' => false, 'message' => 'ConvertKit not configured'];
    }
    
    $url = "https://api.convertkit.com/v3/forms/{$form_id}/subscribe";
    
    $data = [
        'api_key' => $api_key,
        'email' => $email,
        'first_name' => $name
    ];
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
    
    $response = curl_exec($ch);
    $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    return ['success' => $http_code === 200, 'message' => $response];
}

/**
 * Database signup
 */
function signupDatabase($name, $email, $config) {
    try {
        $pdo = new PDO(
            "mysql:host={$config['db_host']};dbname={$config['db_name']}",
            $config['db_user'],
            $config['db_pass']
        );
        
        $stmt = $pdo->prepare("INSERT INTO newsletter_signups (name, email, signup_date) VALUES (?, ?, NOW())");
        $result = $stmt->execute([$name, $email]);
        
        return ['success' => $result, 'message' => 'Signup successful'];
    } catch (PDOException $e) {
        return ['success' => false, 'message' => 'Database error: ' . $e->getMessage()];
    }
}

/**
 * Email notification signup
 */
function signupEmail($name, $email, $config) {
    $to = $config['notification_email'];
    $subject = 'New Newsletter Signup - Little Color Wonders';
    $message = "New newsletter signup:\n\nName: {$name}\nEmail: {$email}\nDate: " . date('Y-m-d H:i:s');
    
    $headers = [
        'From: ' . $config['from_email'],
        'Reply-To: ' . $config['from_email'],
        'Content-Type: text/plain; charset=UTF-8'
    ];
    
    $success = mail($to, $subject, $message, implode("\r\n", $headers));
    
    // Also send welcome email to subscriber
    if ($success) {
        sendWelcomeEmail($name, $email, $config);
    }
    
    return ['success' => $success, 'message' => $success ? 'Email sent' : 'Email failed'];
}

/**
 * Send welcome email with download link
 */
function sendWelcomeEmail($name, $email, $config) {
    $subject = 'Your Free Printables Are Here! 🎨';
    $download_link = 'https://yourdomain.com/downloads/free-sampler.pdf';
    
    $message = "Hi {$name}!\n\n";
    $message .= "Thank you for joining the Little Color Wonders family! 🎉\n\n";
    $message .= "Your free printable sampler pack is ready for download:\n";
    $message .= "{$download_link}\n\n";
    $message .= "What's included:\n";
    $message .= "• 3 fun coloring pages\n";
    $message .= "• 1 alphabet tracing sheet\n";
    $message .= "• 1 maze puzzle\n\n";
    $message .= "Simply download, print, and watch your little ones have fun learning!\n\n";
    $message .= "Happy learning!\n";
    $message .= "The Little Color Wonders Team\n\n";
    $message .= "P.S. Keep an eye on your inbox for more free activities and special offers! 💝";
    
    $headers = [
        'From: ' . $config['from_name'] . ' <' . $config['from_email'] . '>',
        'Reply-To: ' . $config['from_email'],
        'Content-Type: text/plain; charset=UTF-8'
    ];
    
    return mail($email, $subject, $message, implode("\r\n", $headers));
}

/**
 * Log signup for analytics
 */
function logSignup($name, $email) {
    $log_data = [
        'timestamp' => date('Y-m-d H:i:s'),
        'name' => $name,
        'email' => $email,
        'ip' => $_SERVER['REMOTE_ADDR'] ?? 'unknown',
        'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? 'unknown'
    ];
    
    $log_entry = json_encode($log_data) . "\n";
    file_put_contents('newsletter_signups.log', $log_entry, FILE_APPEND | LOCK_EX);
}

// Log this signup
logSignup($name, $email);
?> 