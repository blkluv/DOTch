import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Head from 'next/head';
import styles from '../../styles/AuctionDetail.module.css';
import { ConnectButton } from '@rainbow-me/rainbowkit';

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

const AuctionDetail = () => {
  const router = useRouter();
  const { id } = router.query;
  const [auction, setAuction] = useState<Auction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isBuying, setIsBuying] = useState(false);
  const [buyAmount, setBuyAmount] = useState('1');
  const [buyError, setBuyError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAuction = async () => {
      if (!id) return;

      try {
        const response = await fetch(`http://localhost:3001/api/auctions/${id}`);
        const data = await response.json();
        if (data.success) {
          setAuction(data.data);
        } else {
          setError('Failed to fetch auction details');
        }
      } catch (err) {
        setError('Error connecting to the server');
      } finally {
        setLoading(false);
      }
    };

    fetchAuction();
  }, [id]);

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

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const handleBuy = async () => {
    if (!auction || !buyAmount) return;

    setIsBuying(true);
    setBuyError(null);

    try {
      // Here you would typically make an API call to your backend
      // For now, we'll just simulate a delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Refresh auction data after successful buy
      const response = await fetch(`http://localhost:3001/api/auctions/${id}`);
      const data = await response.json();
      if (data.success) {
        setAuction(data.data);
      }
    } catch (err) {
      setBuyError('Failed to process purchase. Please try again.');
    } finally {
      setIsBuying(false);
    }
  };

  const calculateTotalPrice = () => {
    if (!auction || !buyAmount) return '0';
    const price = parseInt(auction.current_price);
    const amount = parseInt(buyAmount);
    return formatDOT((price * amount).toString());
  };

  if (loading) return <div className={styles.container}>Loading...</div>;
  if (error) return <div className={styles.container}>{error}</div>;
  if (!auction) return <div className={styles.container}>Auction not found</div>;

  return (
    <div className={styles.container}>
      <Head>
        <title>{auction.name} - DOTch Auction</title>
        <meta
          content={`Details for ${auction.name} auction`}
          name="description"
        />
        <link href="/favicon.ico" rel="icon" />
      </Head>

      <main className={styles.main}>
        <div className={styles.header}>
          <button 
            className={styles.backButton}
            onClick={() => router.push('/')}
          >
            ← Back to Auctions
          </button>
          <ConnectButton />
        </div>

        <div className={styles.auctionDetail}>
          <h1 className={styles.title}>{auction.name}</h1>
          <p className={styles.description}>{auction.description}</p>

          <div className={styles.statusContainer}>
            <span className={`${styles.status} ${styles[auction.status.toLowerCase()]}`}>
              {auction.status}
            </span>
          </div>

          <div className={styles.detailsGrid}>
            <div className={styles.detailCard}>
              <h3>Current Price</h3>
              <p className={styles.price}>{formatDOT(auction.current_price)}</p>
            </div>

            <div className={styles.detailCard}>
              <h3>Time Remaining</h3>
              <p>{formatTime(auction.time_remaining)}</p>
            </div>

            <div className={styles.detailCard}>
              <h3>Progress</h3>
              <p>{formatNumber(auction.tokens_sold)} / {formatNumber(auction.tokens_total)}</p>
            </div>

            <div className={styles.detailCard}>
              <h3>Token Address</h3>
              <p className={styles.address}>{auction.token_address}</p>
            </div>
          </div>

          {auction.is_active && (
            <div className={styles.buySection}>
              <h2>Buy Tokens</h2>
              <div className={styles.buyForm}>
                <div className={styles.buyInput}>
                  <label htmlFor="buyAmount">Amount:</label>
                  <input
                    type="number"
                    id="buyAmount"
                    value={buyAmount}
                    onChange={(e) => setBuyAmount(e.target.value)}
                    min="1"
                    max={parseInt(auction.tokens_total) - parseInt(auction.tokens_sold)}
                    step="1"
                  />
                </div>
                <div className={styles.totalPrice}>
                  <span>Total Price:</span>
                  <span className={styles.price}>{calculateTotalPrice()}</span>
                </div>
                <button
                  className={styles.buyButton}
                  onClick={handleBuy}
                  disabled={isBuying || !buyAmount || parseInt(buyAmount) <= 0}
                >
                  {isBuying ? 'Processing...' : 'Buy Tokens'}
                </button>
                {buyError && <p className={styles.error}>{buyError}</p>}
              </div>
            </div>
          )}

          <div className={styles.timeline}>
            <h2>Auction Timeline</h2>
            <div className={styles.timelineItem}>
              <span>Start Time:</span>
              <span>{formatDate(auction.start_time)}</span>
            </div>
            <div className={styles.timelineItem}>
              <span>End Time:</span>
              <span>{formatDate(auction.end_time)}</span>
            </div>
            <div className={styles.timelineItem}>
              <span>Duration:</span>
              <span>{auction.duration / (1000 * 60 * 60 * 24)} days</span>
            </div>
          </div>

          <div className={styles.pricing}>
            <h2>Pricing Details</h2>
            <div className={styles.pricingItem}>
              <span>Starting Price:</span>
              <span>{formatDOT(auction.start_price)}</span>
            </div>
            <div className={styles.pricingItem}>
              <span>Minimum Price:</span>
              <span>{formatDOT(auction.min_price)}</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AuctionDetail; 