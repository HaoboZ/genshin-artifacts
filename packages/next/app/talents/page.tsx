'use client';
import PageContainer from '@/components/page/container';
import PageTitle from '@/components/page/title';
import TalentBooks from './books';
import TalentsWeekly from './weekly';

export default function Talents() {
	return (
		<PageContainer>
			<PageTitle>Talents</PageTitle>
			<TalentBooks />
			<TalentsWeekly />
		</PageContainer>
	);
}
