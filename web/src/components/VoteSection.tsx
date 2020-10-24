import React, { useEffect, useState } from 'react';
import { Flex, IconButton } from '@chakra-ui/core';
import { QuestionSnippetFragment, useVoteMutation } from '../generated/graphql';
import { cookies, setOptions } from '../utils/cookies';

interface VoteSectionProps {
  question: QuestionSnippetFragment;
}

export const VoteSection: React.FC<VoteSectionProps> = ({ question }) => {
  const [loadingState, setLoadingState] = useState<
    'vote-loading' | 'unvote-loading' | 'not-loading'
  >('not-loading');
  const getVoteStatus = () => {
    if (!cookies.get(`vote_${question.id}`)) return false;
    if (cookies.get(`vote_${question.id}`) !== cookies.get('iask_guestId'))
      return false;
    return true;
  };
  const voteStatus = getVoteStatus();
  const [isVoted, setIsVoted] = useState(voteStatus);
  useEffect(() => {
    setIsVoted(voteStatus);
  }, [voteStatus]);
  const [, vote] = useVoteMutation();
  return (
    <Flex direction="column" justifyContent="center" alignItems="center" mr={4}>
      <IconButton
        variantColor={isVoted ? 'green' : undefined}
        onClick={async () => {
          setLoadingState('vote-loading');
          await vote({
            questionId: question.id,
            value: isVoted ? -1 : 1,
          });
          setLoadingState('not-loading');
          if (!isVoted) {
            setIsVoted(true);
            cookies.set(
              `vote_${question.id}`,
              cookies.get('iask_guestId'),
              setOptions
            );
          } else if (getVoteStatus()) {
            setIsVoted(false);
            cookies.remove(`vote_${question.id}`);
          }
        }}
        isLoading={loadingState === 'vote-loading'}
        aria-label="upvote question"
        icon="chevron-up"
      />
      {question.points}
    </Flex>
  );
};
