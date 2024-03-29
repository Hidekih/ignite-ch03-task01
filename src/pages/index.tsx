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
import { useCallback } from 'react';

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

// yarn test src/__tests__/pages/Home.spec.tsx

export default function Home({ postsPagination }: HomeProps) {
  const [ posts, setPosts ] = useState<Post[]>([])
  const [ nextPage, setNextPage ] = useState<string | null>(''); 

  useEffect(() => {
    if (postsPagination) {
      setPosts(postsPagination.results.map(post => {
        return {
          ...post,
          first_publication_date: format(
            new Date(post.first_publication_date),
            "dd MMM yyyy",
            {
              locale: ptBR,
            }
          ),
        }
      }));
    }

    if (postsPagination.next_page) {
      setNextPage(postsPagination.next_page)
    }
  }, []);

  const handleLoadMorePosts = useCallback(() => {
    console.log(!!nextPage)
    if(nextPage) {
      fetch(nextPage)
      .then(res => {
        return res.json();
      })
      .then(response => {
        const loadedPosts = response.results.map(post => {
          return {
            uid: post.uid,
            first_publication_date: format(
              new Date(post.first_publication_date),
              "dd MMM yyyy",
              {
                locale: ptBR,
              }
            ),
            data: {
              title: post.data.title,
              subtitle: post.data.subtitle,
              author: post.data.author,
            }
          }
        })
        
        setPosts([ ...posts, ...loadedPosts ]);
        // setPosts([ ...posts, loadedPosts ]);
        setNextPage(response.next_page);
      })
    }
  }, [nextPage]);

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

          {nextPage && (
            <button 
              className={styles.loadMorePosts}
              onClick={handleLoadMorePosts}  
            >
              Carregar mais posts {}
            </button>
          )}

        </main>
      </div>
    </>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query(
    Prismic.Predicates.at('document.type', 'post'),
    {
      pageSize: 20,
      page: 1
      // orderings : '[my.post.date desc]'
    }
  );

  // console.log(JSON.stringify(postsResponse, null, 2));

  // Parsear os dados no useEffect
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
        next_page: postsResponse.next_page,
        results: posts,
      },
    }
  }
};
