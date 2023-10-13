'use client';
import type { ReactNode } from 'react';
import type { PageBackProps } from './back';
import PageBack from './back';
import PageContainer from './container';
import type { PageTitleProps } from './title';
import PageTitle from './title';

export default function Page({
	title,
	titleProps,
	hideBack,
	backProps,
	children,
}: {
	title?: string;
	titleProps?: PageTitleProps;
	hideBack?: boolean;
	backProps?: PageBackProps;
	children?: ReactNode;
}) {
	return (
		<PageContainer>
			{!hideBack && <PageBack {...backProps} />}
			{title && <PageTitle {...titleProps}>{title}</PageTitle>}
			{children}
		</PageContainer>
	);
}
