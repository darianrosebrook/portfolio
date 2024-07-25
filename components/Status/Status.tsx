'use client'
import Styles from './Status.module.scss';

type StatusType = 'success' | 'error' | 'warning' | 'info';

type StatusProps = {
    status: StatusType; 
    children: string;
};

const Status: React.FC<StatusProps> = ({ status, children }) => {
    return (
        <>
            <div className={`${Styles.status} ${Styles[status]}`}>
                <span className={Styles['status--indicator']} />
                <p>{children}</p>
            </div>
        </>
    );
};

export default Status;