import dynamic from 'next/dynamic';

function NoSsr({ children }) {
	return children;
}

export default dynamic(async () => NoSsr, { ssr: false });
