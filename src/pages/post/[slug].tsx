import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router'

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

// yarn test src/__tests__/pages/Post.spec.tsx


export default function Post({ post }: PostProps) {
  const postPage = {
    ...post,
    first_publication_date: format(
      new Date(post.first_publication_date),
      "dd MMM yyyy",
      {
        locale: ptBR,
      }
    ),
  }

  /**
   const docs = await Client().query(
    Prismic.Predicates.at('document.type', 'page'),
    { lang: '*' }
  ); 
   
   */

  const router = useRouter()

  if (router.isFallback) {
    return <div>Carregando...</div>
  }
  
  return (
    <>
      <Head>
        <title>{postPage.data.title}</title>
      </Head>
      <div className={commonStyles.container}>
        <img className={styles.banner} src={post.data.banner.url} alt="banner" />

        <article className={styles.postContainer}>
          <h1>{postPage.data.title}</h1>
          <section>
            <span>
              <FiCalendar size={20} color={'#D7D7D7'} /> 
              <time>{postPage.first_publication_date}</time>
            </span>
            <span>
              <FiUser size={20} color={'#D7D7D7'} />
              {postPage.data.author}
            </span>
          </section>

          { postPage.data.content.length > 0 && postPage.data.content.map(c => (
            <div className={styles.content} key={c.heading}>
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

  const post = {
    first_publication_date: response.first_publication_date,
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
