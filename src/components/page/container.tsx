import type { ContainerProps } from '@mui/joy';
import { Container } from '@mui/joy';
import NoSsr from '../noSsr';

export default function PageContainer({ noSsr, ...props }: { noSsr?: boolean } & ContainerProps) {
	if (noSsr)
		return (
			<NoSsr>
				<Container {...props} />
			</NoSsr>
		);

	return <Container {...props} />;
}
