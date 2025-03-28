import React from 'react';
import { useRouter } from 'next/router';
import styles from '../styles/AuctionCard.module.css';

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

interface AuctionCardProps {
  auction: Auction;
}

const AuctionCard: React.FC<AuctionCardProps> = ({ auction }) => {
  const router = useRouter();

    const formatDOT = (amount: string) => {
      return (parseInt(amount) / 1000000000000000000).toFixed(2) + ' DOT';
    };

    const formatNumber = (amount: string) => {
      return (parseInt(amount) / 1000000000000000000).toFixed(2);
    };

  const formatTime = (ms: number) => {
    if (ms <= 0) return 'Ended';
    const days = Math.floor(ms / (1000 * 60 * 60 * 24));
    const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    return `${days}d ${hours}h`;
  };

  const handleClick = () => {
    router.push(`/auction/${auction.id}`);
  };

  return (
    <div className={styles.card} onClick={handleClick}>
      <h2>{auction.name}</h2>
      <p className={styles.description}>{auction.description}</p>
      <div className={styles.details}>
        <div className={styles.row}>
          <span>Status:</span>
          <span className={`${styles.status} ${styles[auction.status.toLowerCase()]}`}>
            {auction.status}
          </span>
        </div>
        <div className={styles.row}>
          <span>Current Price:</span>
          <span>{formatDOT(auction.current_price)}</span>
        </div>
        <div className={styles.row}>
          <span>Time Remaining:</span>
          <span>{formatTime(auction.time_remaining)}</span>
        </div>
        <div className={styles.row}>
          <span>Tokens Sold:</span>
          <span>{formatNumber(auction.tokens_sold)} / {formatNumber(auction.tokens_total)}</span>
        </div>
      </div>
    </div>
  );
};

export default AuctionCard; 