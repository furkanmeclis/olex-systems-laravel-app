<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;
use Kreait\Firebase\Factory;
use Kreait\Firebase\Messaging\CloudMessage;

class FirebaseNotification extends Notification
{
    use Queueable;

    private $title;
    private $body;
    private $token;
    private $url;

    public function __construct($title, $body, $token,$url = null)
    {
        $this->title = $title;
        $this->body = $body;
        $this->token = $token;
        $this->url = $url;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function sendPushNotification(): void
    {
        $firebase = (new Factory)
            ->withServiceAccount(__DIR__.'/../../resources/config/firebase_credentials.json');

        $messaging = $firebase->createMessaging();

        $message = CloudMessage::fromArray([
            'notification' => [
                'title' => $this->title,
                'body' => $this->body,
                'image' => env("APP_URL").'/icons/logo-1024x1024.png',
            ],
            'data' => [
                'icon' => env("APP_URL").'/icons/logo-1024x1024.png',
                'url' => $this->url ?? env("APP_URL").'/',
            ],
            'token' => $this->token,
        ]);

        $messaging->send($message);
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray($notifiable): array
    {
        return [
            'title' => $this->title,
            'body' => $this->body,
        ];
    }
}
