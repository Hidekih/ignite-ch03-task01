import { GetStaticProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';

import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import { FiUser, FiCalendar } from 'react-icons/fi'

import Prismic from '@prismicio/client'
import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import { useEffect } from 'react';
import { useState } from 'react';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps) {
  const [ posts, setPosts ] = useState<Post[]>([])

  useEffect(() => {
    if (postsPagination) {
      setPosts(postsPagination.results)
    }
  }, [postsPagination]);

  return (
    <>
      <Head>
        <title>Home</title>
      </Head>

      <div className={styles.container}>
        <main className={styles.postContainer}>
          { posts.length > 0 &&  posts.map(post => (
            <Link key={post.uid} href={`/post/${post.uid}`}>
              <a className={styles.post}>
                <strong>{post.data.title}</strong>
                <p>{post.data.subtitle}</p>
                <footer>
                  <span>
                    <FiCalendar size={20} color={'#D7D7D7'} />
                    <time>{post.first_publication_date}</time>
                  </span>
                  <span>
                    <FiUser size={20} color={'#D7D7D7'} />
                    {post.data.author}
                  </span>
                </footer>
              </a>
            </Link>
          ))}

        </main>
      </div>
    </>
  )
}

export const getStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query(
    Prismic.Predicates.at('document.type', 'post'),
    {
      pageSize: 20,
      // orderings : '[my.post.date desc]'
    }
  );

  // console.log(JSON.stringify(postsResponse, null, 2));

  const posts = postsResponse.results.map(post => {
    return {
      uid: post.uid,
      first_publication_date: post.first_publication_date,
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      }
    }
  })

  return {
    props: { 
      postsPagination: {
        next_page: 'teste',
        results: posts,
      },
    }
  }
};
