import { useCallback, useEffect, useState } from 'react';
import AxiosInstance from './AxiosInstance';
import './ITTicketPortal.css';

const initialForm = {
  title: '',
  description: '',
  category: 'OTHER',
  department: '',
  location: '',
};

const categories = [
  ['HARDWARE', 'Hardware'],
  ['SOFTWARE', 'Software'],
  ['NETWORK', 'Network'],
  ['PRINTER', 'Printer'],
  ['EMAIL', 'Email'],
  ['ACCOUNT_ACCESS', 'Account access'],
  ['OTHER', 'Other'],
];

export default function ITTicketPortal() {
  const [tickets, setTickets] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const loadTickets = useCallback(async () => {
    setError('');
    try {
      const response = await AxiosInstance.get('api/tickets/');
      setTickets(response.data);
    } catch (requestError) {
      setError(
        requestError.response?.data?.detail ||
        'Unable to load tickets. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const response = await AxiosInstance.post('api/tickets/', form);
      setTickets((currentTickets) => [response.data, ...currentTickets]);
      setForm(initialForm);
    } catch (requestError) {
      const details = requestError.response?.data;
      setError(
        details?.detail ||
        (details ? JSON.stringify(details) : 'Unable to submit your ticket. Please try again.'),
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="ticket-portal">
      <section className="ticket-panel">
        <h1>IT Tickets</h1>
        <p>Submit a support request or review your existing tickets.</p>
        {error && <p className="ticket-error" role="alert">{error}</p>}

        <form className="ticket-form" onSubmit={handleSubmit}>
          <label>
            Title
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              maxLength={200}
              required
            />
          </label>
          <label>
            Description
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              required
              rows={4}
            />
          </label>
          <label>
            Category
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              {categories.map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </label>
          <label>
            Department
            <input
              value={form.department}
              onChange={(e) => setForm({ ...form, department: e.target.value })}
              maxLength={120}
            />
          </label>
          <label>
            Location
            <input
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              maxLength={150}
            />
          </label>
          <button type="submit" disabled={submitting}>
            {submitting ? 'Submitting…' : 'Submit ticket'}
          </button>
        </form>

        <section className="ticket-list" aria-labelledby="ticket-list-title">
          <h2 id="ticket-list-title">Your tickets</h2>
          {loading ? (
            <p>Loading tickets…</p>
          ) : tickets.length === 0 ? (
            <p>No tickets yet.</p>
          ) : (
            <ul>
              {tickets.map((ticket) => (
                <li key={ticket.id}>
                  <h3>{ticket.title}</h3>
                  <p>{ticket.description}</p>
                  <p>{ticket.category} · {ticket.status} · {ticket.ticket_number}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </section>
    </main>
  );
}
