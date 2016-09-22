import './Comment.less';
import React from 'react';

import { short } from 'lib/formatDifference';
import RedditLinkHijacker from 'app/components/RedditLinkHijacker';

const T = React.PropTypes;

export default function MessagesComment(props) {
  const { comment } = props;

  return (
    <div className='MessagesComment'>
      <div className='MessagesComment__title'>
        { comment.linkTitle }
      </div>
      <div className='MessagesComment__metaData'>
        { `${ comment.author } \u2022 r/${ comment.subreddit } \u2022 ${ short(comment.createdUTC) }` }
      </div>
      <RedditLinkHijacker>
        <div
          className='MessagesComment__body'
          dangerouslySetInnerHTML={ { __html: comment.bodyHTML } }
        />
      </RedditLinkHijacker>
    </div>
  );
}

MessagesComment.propTypes = {
  comment: T.object.isRequired,
};