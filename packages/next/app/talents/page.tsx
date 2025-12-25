import PageTitle from '@/components/page/title';
import { Container } from '@mui/material';
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
