import { SVGAttributes } from 'react';

export default function AppLogoIcon(props: SVGAttributes<SVGElement>) {
    return (
        <svg
            {...props}
            viewBox="0 0 24 24"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path d="M4 6H2V20C2 21.1046 2.89543 22 4 22H18V20H4V6Z" />
            <path d="M20 2H8C6.89543 2 6 2.89543 6 4V16C6 17.1046 6.89543 18 8 18H20C21.1046 18 22 17.1046 22 16V4C22 2.89543 21.1046 2 20 2ZM18 14H10V12H18V14ZM18 10H10V8H18V10ZM18 6H13V4H18V6Z" />
        </svg>
    );
}