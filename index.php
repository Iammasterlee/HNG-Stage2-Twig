<?php
require_once __DIR__ . '/vendor/autoload.php';

$loader = new \Twig\Loader\FilesystemLoader(__DIR__ . '/templates');
$twig = new \Twig\Environment($loader, [
    //'cache' => __DIR__ . '/cache', // optional
]);

$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// normalize path (trim trailing slash except root)
if ($path !== '/' && substr($path, -1) === '/') {
    $path = rtrim($path, '/');
}

switch ($path) {
    case '/':
        echo $twig->render('pages/landing.html.twig', ['title' => 'Ticketing App']);
        break;

    case '/auth/login':
        echo $twig->render('pages/auth_login.html.twig', ['title' => 'Login - Ticketing App']);
        break;

    case '/auth/signup':
        echo $twig->render('pages/auth_signup.html.twig', ['title' => 'Signup - Ticketing App']);
        break;

    case '/dashboard':
        echo $twig->render('pages/dashboard.html.twig', ['title' => 'Dashboard - Ticketing App']);
        break;

    case '/tickets':
        echo $twig->render('pages/tickets.html.twig', ['title' => 'Tickets - Ticketing App']);
        break;

    default:
        header("HTTP/1.0 404 Not Found");
        echo $twig->render('pages/landing.html.twig', ['title' => 'Not Found - Ticketing App', 'notFound' => true]);
        break;
}
