import { ConnectButton } from '@rainbow-me/rainbowkit';
import type { NextPage } from 'next';
import Head from 'next/head';
import { useEffect, useState } from 'react';
import styles from '../styles/Home.module.css';
import AuctionCard from '../components/AuctionCard';
import CreateAuctionForm from '../components/CreateAuctionForm';

interface Auction {
  id: number;
  name: string;
  description: string;
  token_address: string;
  start_time: number;
  duration: number;
  end_time: number;
  start_price: string;
  min_price: string;
  current_price: string;
  time_remaining: number;
  tokens_sold: string;
  tokens_total: string;
  is_active: boolean;
  status: string;
}

const Home: NextPage = () => {
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    const fetchAuctions = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/auctions');
        const data = await response.json();
        if (data.success) {
          setAuctions(data.data);
        } else {
          setError('Failed to fetch auctions');
        }
      } catch (err) {
        setError('Error connecting to the server');
      } finally {
        setLoading(false);
      }
    };

    fetchAuctions();
  }, []);

  return (
    <div className={styles.container}>
      <Head>
        <title>DOTch Auction</title>
        <meta
          content="DOTch Auction - Polkadot Token Auctions"
          name="description"
        />
        <link href="/favicon.ico" rel="icon" />
      </Head>

      <main className={styles.main}>
        <div className={styles.header}>
          <h1 className={styles.title}>DOTch Auction</h1>
          <div className={styles.headerButtons}>
            <button 
              className={styles.createButton}
              onClick={() => setShowCreateForm(true)}
            >
              Create Auction
            </button>
            <ConnectButton />
          </div>
        </div>

        {loading && <p>Loading auctions...</p>}
        {error && <p className={styles.error}>{error}</p>}
        
        <div className={styles.auctionGrid}>
          {auctions.map((auction) => (
            <AuctionCard key={auction.id} auction={auction} />
          ))}
        </div>

        {showCreateForm && (
          <CreateAuctionForm onClose={() => setShowCreateForm(false)} />
        )}
      </main>
    </div>
  );
};

export default Home;
