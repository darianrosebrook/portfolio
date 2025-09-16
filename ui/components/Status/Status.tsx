'use client';
import Styles from './Status.module.scss';
import { Intent, StatusIntent, normalizeStatusIntent } from '@/types';

type StatusProps = {
  status: StatusIntent;
  children: string;
};

const Status: React.FC<StatusProps> = ({ status, children }) => {
  const intent: Intent = normalizeStatusIntent(status);
  return (
    <>
      <div className={`${Styles.status} ${Styles[intent]}`}>
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M6.06974 1.35872C6.40266 0.51457 7.59734 0.51457 7.93026 1.35872L9.1034 4.33323C9.20504 4.59095 9.40905 4.79496 9.66677 4.8966L12.6413 6.06974C13.4854 6.40266 13.4854 7.59734 12.6413 7.93026L9.66677 9.1034C9.40905 9.20504 9.20504 9.40905 9.1034 9.66677L7.93026 12.6413C7.59734 13.4854 6.40266 13.4854 6.06974 12.6413L4.8966 9.66677C4.79496 9.40905 4.59095 9.20504 4.33323 9.1034L1.35872 7.93026C0.51457 7.59734 0.51457 6.40266 1.35872 6.06974L4.33323 4.8966C4.59095 4.79496 4.79496 4.59095 4.8966 4.33323L6.06974 1.35872Z" />
        </svg>

        <p>{children}</p>
      </div>
    </>
  );
};

export default Status;
