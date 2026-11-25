import { Container, Stack } from '@mui/material';

import PageTitle from '@/components/page/pageTitle';

import AccountSignIn from './accountSignIn';
import { getInitialAccount } from './getInitialAccount';
import Settings from './index';

export default async function SettingsPage() {
	const account = await getInitialAccount();

	return (
		<Container>
			<PageTitle>Settings</PageTitle>
			<Stack spacing={2}>
				<AccountSignIn initialAccount={account} />
				<Settings />
			</Stack>
		</Container>
	);
}
