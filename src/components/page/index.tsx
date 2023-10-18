'use client';
import { NoSsr } from '@mui/material';
import type { ReactNode } from 'react';
import type { PageBackProps } from './back';
import PageBack from './back';
import PageContainer from './container';
import type { PageTitleProps } from './title';
import PageTitle from './title';

export default function Page({
	noSsr,
	title,
	titleProps,
	hideBack,
	backProps,
	children,
}: {
	noSsr?: boolean;
	title?: string;
	titleProps?: PageTitleProps;
	hideBack?: boolean;
	backProps?: PageBackProps;
	children?: ReactNode;
}) {
	if (noSsr) {
		return (
			<PageContainer>
				<NoSsr>
					{!hideBack && <PageBack {...backProps} />}
					{title && <PageTitle {...titleProps}>{title}</PageTitle>}
					{children}
				</NoSsr>
			</PageContainer>
		);
	}

	return (
		<PageContainer>
			{!hideBack && <PageBack {...backProps} />}
			{title && <PageTitle {...titleProps}>{title}</PageTitle>}
			{children}
		</PageContainer>
	);
}
