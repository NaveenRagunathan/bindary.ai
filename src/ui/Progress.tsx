import './Progress.css';

interface ProgressBarProps {
    value: number; // 0-100
    max?: number;
    size?: 'sm' | 'md' | 'lg';
    variant?: 'default' | 'success' | 'warning';
    showLabel?: boolean;
    label?: string;
    className?: string;
}

export function ProgressBar({
    value,
    max = 100,
    size = 'md',
    variant = 'default',
    showLabel = false,
    label,
    className = '',
}: ProgressBarProps) {
    const percentage = Math.min(100, Math.max(0, (value / max) * 100));

    return (
        <div className={`progress-wrapper ${className}`}>
            {(showLabel || label) && (
                <div className="progress-label">
                    <span>{label}</span>
                    {showLabel && <span>{Math.round(percentage)}%</span>}
                </div>
            )}
            <div className={`progress-bar progress-${size}`}>
                <div
                    className={`progress-fill progress-${variant}`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
}

interface ProgressCircleProps {
    value: number; // 0-100
    size?: number;
    strokeWidth?: number;
    variant?: 'default' | 'success';
    showValue?: boolean;
    className?: string;
}

export function ProgressCircle({
    value,
    size = 80,
    strokeWidth = 6,
    variant = 'default',
    showValue = true,
    className = '',
}: ProgressCircleProps) {
    const percentage = Math.min(100, Math.max(0, value));
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;

    return (
        <div className={`progress-circle-wrapper ${className}`} style={{ width: size, height: size }}>
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                <circle
                    className="progress-circle-bg"
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    strokeWidth={strokeWidth}
                />
                <circle
                    className={`progress-circle-fill progress-circle-${variant}`}
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    transform={`rotate(-90 ${size / 2} ${size / 2})`}
                />
            </svg>
            {showValue && (
                <div className="progress-circle-value">
                    <span className="progress-circle-number">{Math.round(percentage)}</span>
                    <span className="progress-circle-percent">%</span>
                </div>
            )}
        </div>
    );
}
