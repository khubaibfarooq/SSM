<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class PlanRenewed extends Notification
{
    use Queueable;

    public $payment;
    public $plan;

    /**
     * Create a new notification instance.
     */
    public function __construct($payment, $plan)
    {
        $this->payment = $payment;
        $this->plan = $plan;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Plan Renewed - ' . $this->plan->name)
            ->greeting('Hello ' . $notifiable->name . '!')
            ->line('Your ' . $this->plan->type . ' plan (' . $this->plan->name . ') has been successfully renewed.')
            ->line('Amount: ' . $this->payment->amount)
            ->line('Date: ' . $this->payment->date->format('Y-m-d H:i:s'))
            ->action('View Account', url('/dashboard'))
            ->line('Thank you for using our application!');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'message' => 'Your ' . $this->plan->type . ' plan (' . $this->plan->name . ') has been renewed for ' . $this->payment->amount,
            'plan_id' => $this->plan->id,
            'payment_id' => $this->payment->id,
            'amount' => $this->payment->amount,
            'date' => $this->payment->date->format('Y-m-d H:i:s')
        ];
    }
}
