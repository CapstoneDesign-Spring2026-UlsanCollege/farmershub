import { Send } from 'lucide-react';

export function MessageComposer({ value, onChange, onSubmit, busy, disabled }) {
  return (
    <form className="message-composer" onSubmit={onSubmit}>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={disabled ? 'Select a conversation' : 'Type a message...'}
        disabled={disabled || busy}
        aria-label="Message"
      />
      <button className="primary-button" type="submit" disabled={disabled || busy || !value.trim()}>
        <Send size={17} />
        <span>{busy ? 'Sending' : 'Send'}</span>
      </button>
    </form>
  );
}
