import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';

import { getPrismicClient } from '../../services/prismic';

import { FiUser, FiCalendar } from 'react-icons/fi'

import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps) {
  console.log(post.data.content[0])
  return (
    <>
      <Head>
        <title>{post.data.title}</title>
      </Head>
      <div className={commonStyles.container}>
        <img className={styles.banner} src={post.data.banner.url} alt="banner" />

        <article className={styles.postContainer}>
          <h1>{post.data.title}</h1>
          <div>
            <span>
              <FiCalendar size={20} color={'#D7D7D7'} /> 
              <time>{post.first_publication_date}</time>
            </span>
            <span>
              <FiUser size={20} color={'#D7D7D7'} />
              {post.data.author}
            </span>
          </div>

          { post.data.content.length > 0 && post.data.content.map(c => (
            <div key={c.heading}>
              <strong>{c.heading}</strong>
              <p>{c.body.text}</p>
            </div>
          ))}
        </article>
      </div>
    </>
  )
}

export const getStaticPaths: GetStaticPaths = async () => { 
  return {
    paths: [],
    fallback: 'blocking',
  }
};

export const getStaticProps: GetStaticProps = async({ params }) => {
  const prismic = getPrismicClient();
  const response = await prismic.getByUID('post', String(params.slug), {});

  /* console.log(JSON.stringify(response.data.content.map(c => {
    return {
      heading: c.heading,
      body: {
        text: c.body.map(body => body.text),
      },
    }
  }), null, 2)) */

  const post = {
    first_publication_date: format(
      new Date(response.first_publication_date),
      "dd MMM yyyy",
      {
        locale: ptBR,
      }
    ),
    data: {
      title: response.data.title,
      banner: {
        url: response.data.banner.url,
      },
      author: response.data.author,
      content: response.data.content.map(c => {
        return {
          heading: c.heading,
          body: {
            text: c.body.map(body => body.text),
          },
        }
      }), 
    },
  }

  return {
    props: { post },
    revalidate: 60 * 30,
  }
};
