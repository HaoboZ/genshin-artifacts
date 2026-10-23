import { Container } from '@mui/material';

import PageTitle from '@/components/page/pageTitle';

import TalentBooks from './talentBooks';
import TalentsWeekly from './talentsWeekly';

export default function Talents() {
	return (
		<Container>
			<PageTitle>Talents</PageTitle>
			<TalentBooks />
			<TalentsWeekly />
		</Container>
	);
}
