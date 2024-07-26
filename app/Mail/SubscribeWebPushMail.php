<?php

namespace App\Mail;

use App\Models\MailRecords;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class SubscribeWebPushMail extends Mailable
{
    use Queueable, SerializesModels;
    private $logoUrl;
    private $name;
    private $link;
    private $notifUrl;

    private $user;
    public $subject = 'İletişim İzinlerinizi Görüntüleyin';

    /**
     * Create a new message instance.
     */
    public function __construct($user)
    {
        $this->user = $user;
        $this->logoUrl = asset("storage/olex-logo-yatay.svg");
        $this->name = $user->name;
        $this->link = route('customer.notify', ['hash' => encrypt($user->id)]);
        $this->notifUrl = route('customer.notify', ['hash' => encrypt($user->id)]);
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: $this->subject,

        );
    }

    /**
     * Get the message content definition.
     * @throws \ReflectionException
     */
    public function content(): Content
    {
        $content = new Content(
            view: 'mails.subscribe-web-push',
            with: [
                "logoUrl" => $this->logoUrl,
                "name" => $this->name,
                "link" => $this->link,
                "notifUrl" => $this->notifUrl,
            ]
        );
        $mailrecord = new MailRecords();
        $mailrecord->subject = $this->subject;
        $mailrecord->to = $this->user->email;
        $mailrecord->content = view("mails.subscribe-web-push", [
            "logoUrl" => $this->logoUrl,
            "name" => $this->name,
            "link" => $this->link,
            "notifUrl" => $this->notifUrl,
        ])->render();
        $mailrecord->save();
        return $content;
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
