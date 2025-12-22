import PageContainer from '@/components/page/container';
import PageTitle from '@/components/page/title';
import TalentBooks from './talentBooks';
import TalentsWeekly from './talentsWeekly';

export default function Talents() {
	return (
		<PageContainer>
			<PageTitle>Talents</PageTitle>
			<TalentBooks />
			<TalentsWeekly />
		</PageContainer>
	);
}
